# ADR-004: Adotar arquitetura escalável por réplicas stateless e serviços de apoio

- **Status:** Proposta
- **Data:** 2026-11-23
- **Autor:** MICHEL DOS SANTOS SERPA (mss8@cesar.school)
- **Turma:** Embarque (segundas)
- **Projeto:** Origem · marketplace da economia criativa e do artesanato de Pernambuco

## Contexto

O Projeto artopop é um marketplace de peças artesanais que deverá atender simultaneamente visitantes consultando o catálogo, compradores utilizando o carrinho e artesãos publicando e atualizando seus anúncios. O backend atual é uma API REST em Express, organizada em camadas e apoiada por PostgreSQL via Prisma. A aplicação usa autenticação JWT e não depende de sessão armazenada no processo da API, o que permite evolução em direção ao crescimento horizontal.

Porém, operações do catálogo podem concentrar leitura, enquanto o processamento de imagens e atualizações de indicadores podem consumir recursos e atrasar requisições HTTP. Além disso, o projeto está implantado em recursos limitados e precisa crescer de forma gradual, sem exigir desde o início uma infraestrutura complexa ou transformar o sistema em microsserviços.

## Preocupações

Escalabilidade, disponibilidade sob aumento de carga, latência, utilização eficiente da infraestrutura, custo operacional e complexidade de implantação.

## Decisão

Adotar a estratégia de escalabilidade horizontal composta por:

1. manter o backend Express stateless, com autenticação por JWT e nenhuma informação de sessão no processo da aplicação;
2. executar múltiplas réplicas da API atrás de um balanceador de carga;
3. utilizar o PostgreSQL compartilhado como fonte única de dados transacionais;
4. utilizar Redis compartilhado para cache de consultas do catálogo e dados frequentemente consultados;
5. mover tarefas assíncronas e com maior custo computacional, como processamento de imagens e atualização de indicadores, para filas com consumidores independentes;
6. criar índices adequados no PostgreSQL e parametrizar a aplicação para monitorar carga e latência;
7. dimensionar réplicas da API e trabalhadores das filas com base em métricas, iniciando com expansão horizontal manual ou automática simples.

A API continuará modularizada em camadas. Cache e filas serão implementados como componentes substituíveis e não poderão armazenar estado obrigatório para validar uma operação crítica. Isso permite que o catálogo seja servido por instâncias equivalentes e que tarefas demoradas não bloqueiem o fluxo das requisições.

## Justificativa

A combinação de API stateless e réplicas permite distribuir requisições entre várias instâncias, evitando que a capacidade dependa de um único processo ou servidor. O uso de JWT já oferece a propriedade necessária para autenticar requisições sem sessões locais. Redis reduz a pressão sobre o banco em consultas repetidas do catálogo, enquanto filas e consumidores independentes evitam que processamento de imagens e atualização de indicadores prolonguem a resposta de endpoints síncronos.

A abordagem atende ao crescimento esperado sem adotar microsserviços no estágio atual: a equipe continua com o monólito modular, preservando velocidade de desenvolvimento e reduzindo o custo de implantação. O PostgreSQL e o Redis podem ser dimensionados separadamente, e a quantidade de instâncias da API pode ser ajustada conforme a demanda.

## Consequências

Benefícios
- Aumentar a capacidade adicionando réplicas da API ou trabalhadores das filas.
- Mantém a resposta a requisições HTTP independente da origem da instância que recebe o acesso.
- Reduz consultas repetidas ao banco por meio de cache compartilhado.
- Remove processamento pesado do caminho síncrono das requisições.
- Facilita testes de carga, observabilidade e implantação progressiva.

Custos e compromissos
- Introduz latência de rede em cada operação entre navegador e API.
- Exige um balanceador de carga e a execução de múltiplas instâncias da API.
- Faz da API e do PostgreSQL compartilhado pontos centrais de contenção e de falha.
- Exige balanceador de carga, Redis, filas e configuração de múltiplos ambientes.
- Introduz necessidade de invalidação de cache e tratamento de falhas de cache ou filas.
- Requisições repetidas podem produzir consistência temporária entre banco e cache.
- O PostgreSQL pode tornar-se o próximo gargalo quando o volume de escritas ou transações crescer.
- A infraestrutura adicionada aumenta os custos operacionais e exige monitoramento, versionamento e testes de recuperação.

## Alternativas consideradas

Escala vertical
Manter uma única instância da API e aumentar recursos da máquina poderia atender cargas iniciais com menor complexidade. A alternativa foi parcialmente aceita como medida temporária, mas não é suficiente como estratégia principal: a capacidade continuará limitada por um único nó e por eventuais reinícios ou falhas.

Microsserviços desde o início
Separar catálogo, pedidos, estoque e usuários em serviços independentes permitiria escalamento específico de cada domínio. Entretanto, dividir o sistema nesta etapa exigiria integração, observabilidade distribuída, automação de implantação e operação de múltiplos bancos ou contratos. Considerando o tamanho da equipe e os recursos disponíveis, essa complexidade não é justificável.

Orientado a Eventos como padrão principal
Foi considerado para processamento assíncrono de imagens e atualização de indicadores, pois permitiria publicar eventos e adicionar consumidores sem alterar o fluxo principal. Porém, adotá-lo como padrão central acrescentaria consistência eventual, barramentos ou filas, rastreabilidade distribuída e maior dificuldade de depuração para um projeto que ainda não precisa dessa desacoplamento em todo o domínio.

CQRS
Foi descartado porque o volume atual não justifica separar modelos de leitura e escrita ou manter uma projeção quase sempre assíncrona. Essa alternativa duplicaria modelos e bases de dados, além de introduzir consistência eventual no catálogo.

Replicação da API sem cache ou filas
Replicar a API apenas distribuindo requisições reduziria parte da carga, mas manteria consultas repetidas no PostgreSQL e impediria o processamento assíncrono de tarefas pesadas. Por isso, cache e filas podem ser adotados como componentes de apoio ao padrão Cliente-servidor.

## Rastreabilidade

**Atributo de qualidade:** Flexibilidade · Escalabilidade

**Cenário que originou a decisão:**

> Durante uma campanha promocional, o número de requisições ao catálogo aumenta de 50 para 500 requisições por segundo em até 10 minutos. A API REST do Origem distribui a carga entre múltiplas instâncias, atendendo pelo menos 95% das respostas entre 200 ms e 800 ms e mantendo a taxa de erros HTTP 5xx abaixo de 1% durante 30 minutos.

**Padrão arquitetural adotado:** Cliente-servidor

**Táticas empacotadas:** Centralizar regra e dado no servidor; Autenticar e autorizar na borda; Limitar a exposição da API; Replicar o servidor para escalar



## Verificação

- **Teste do cenário:** Ambiente: utilizar homologação, não apenas executar manualmente no navegador.
Carga inicial: enviar 50 requisições por segundo durante 5 minutos.
Aumento: subir gradualmente até 500 requisições por segundo em 10 minutos.
Pico: manter 500 requisições por segundo por 30 minutos.
Operação: pesquisar e listar produtos no catálogo.
Replicas: executar pelo menos duas instâncias da API.
Métricas: coletar latência p95, erros 5xx, CPU, memória e consultas ao PostgreSQL.

A decisão é considerada confirmada se:
pelo menos 95% das respostas forem concluídas entre 200 ms e 800 ms;
menos de 1% das respostas forem erros HTTP 5xx;
o PostgreSQL não ficar sobrecarregado além do limite operacional definido;
retirar uma réplica durante o teste não interromper o sistema nem impedir o balanceador de redistribuir a carga.

---

_Gerado pelo estudo dirigido de Arquitetura de Software · ADS020 · 2026.2._
