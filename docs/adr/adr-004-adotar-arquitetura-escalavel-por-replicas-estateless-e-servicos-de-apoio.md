# ADR-004: Adotar arquitetura escalável por réplicas stateless e serviços de apoio

- **Status:** Aceita
- **Data:** 2026-11-23
- **Autor:** MICHEL DOS SANTOS SERPA (mss8@cesar.school)
- **Turma:** Embarque (segundas)
- **Projeto:** artpop · marketplace da economia criativa e do artesanato de Pernambuco

## Contexto

O Projeto artopop é um marketplace de peças artesanais que deverá atender simultaneamente visitantes consultando o catálogo, compradores utilizando o carrinho e artesãos publicando e atualizando seus anúncios. O frontend utiliza Next.js e React, e o backend atual é uma API REST em Express, organizada em camadas e apoiada por PostgreSQL via Prisma. A aplicação usa autenticação JWT e não depende de sessão armazenada no processo da API, o que permite evolução em direção ao crescimento horizontal.

Porém, operações do catálogo podem concentrar leitura, enquanto o processamento de imagens e atualizações de indicadores podem consumir recursos e atrasar requisições HTTP. Além disso, o projeto está implantado em recursos limitados e precisa crescer de forma gradual, sem exigir desde o início uma infraestrutura complexa ou transformar o sistema em microsserviços. Embora a aplicação já use o padrão cliente-servidor, é necessário registrar explicitamente o que executa no navegador, o que cabe ao servidor e o contrato entre frontend e API.

## Preocupações

Escalabilidade, disponibilidade sob aumento de carga, latência, utilização eficiente da infraestrutura, custo operacional, complexidade de implantação, compatibilidade com a stack de Desenvolvimento Web e clareza do contrato entre cliente e servidor.

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

### Fronteira cliente-servidor e contrato da API

- **Cliente:** a aplicação Next.js/React apresenta a interface, navegação e interações no navegador. O frontend chama a API por `frontend/src/services/api/client.ts`, usando a origem configurada em `NEXT_PUBLIC_API_URL` e caminhos sob `/api`. Estado e validações de conveniência no cliente não substituem as regras nem as verificações de segurança do servidor.
- **Servidor:** o processo Node.js/Express em `backend/` recebe as requisições, aplica autenticação e autorização, valida as operações e executa as regras de negócio. O acesso ao PostgreSQL é feito pelo backend por meio do Prisma; o navegador não se conecta diretamente ao banco.
- **Contrato:** frontend e API comunicam-se por HTTP, usando recursos REST sob `/api`, JSON quando aplicável, métodos e códigos de status HTTP. Operações protegidas recebem o JWT no cabeçalho `Authorization: Bearer`. A API documenta seus recursos em `docs/api.md` e publica a descrição OpenAPI em `/api/docs`.
- **Configuração e implantação:** o endereço da API é configurado no frontend por `NEXT_PUBLIC_API_URL`; o backend deve permitir a origem do frontend por `CORS_ORIGIN`. Frontend e API são componentes separáveis para implantação, mantendo a API stateless e escalável conforme as demais decisões deste ADR.

## Justificativa

A combinação de API stateless e réplicas permite distribuir requisições entre várias instâncias, evitando que a capacidade dependa de um único processo ou servidor. O uso de JWT já oferece a propriedade necessária para autenticar requisições sem sessões locais. Redis reduz a pressão sobre o banco em consultas repetidas do catálogo, enquanto filas e consumidores independentes evitam que processamento de imagens e atualização de indicadores prolonguem a resposta de endpoints síncronos.

A separação explícita entre navegador e API mantém apresentação e interação no frontend, e regras de negócio, autorização e persistência no servidor. O contrato HTTP/JSON permite que cada componente seja implantado e evolua separadamente, desde que preserve compatibilidade com os caminhos, formatos e códigos de resposta documentados.

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
- A comunicação entre navegador e API depende da rede e exige configurar corretamente `NEXT_PUBLIC_API_URL` e `CORS_ORIGIN`.
- Alterações incompatíveis nos endpoints ou formatos JSON exigem mudanças coordenadas no frontend e no backend.
- Validações importantes precisam ser feitas no servidor, mesmo quando o frontend também valida dados para melhorar a experiência de uso.

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

Acesso direto do navegador ao banco de dados
Foi descartado porque exporia credenciais ou exigiria conceder ao cliente acesso direto à persistência, contornando a autenticação, autorização e regras centralizadas na API.

## Rastreabilidade

**Atributos de qualidade:** Flexibilidade · Escalabilidade · Compatibilidade · Interoperabilidade · Segurança

**Cenário que originou a decisão:**

> Durante uma campanha promocional, o número de requisições ao catálogo aumenta de 50 para 500 requisições por segundo em até 10 minutos. A API REST do Origem distribui a carga entre múltiplas instâncias, atendendo pelo menos 95% das respostas entre 200 ms e 800 ms e mantendo a taxa de erros HTTP 5xx abaixo de 1% durante 30 minutos.

Na fronteira entre os componentes, o navegador envia requisições HTTP aos recursos `/api` e recebe respostas conforme o contrato REST/JSON. Para operações autenticadas, envia o JWT como Bearer; o backend aplica as regras de acesso e, quando necessário, consulta o PostgreSQL. O navegador não acessa diretamente a persistência.

**Padrão arquitetural adotado:** Cliente-servidor

**Táticas empacotadas:** Centralizar regra e dado no servidor; Autenticar e autorizar na borda; Limitar a exposição da API; Replicar o servidor para escalar

**Módulos e documentação relacionados:**

- `frontend/src/services/api/client.ts`
- `backend/src/app.ts`
- `backend/src/config/cors.ts`
- `docs/api.md`
- `netlify.toml`


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

Também verificar uma operação pública e uma operação autenticada pela aplicação cliente: a primeira deve responder conforme o contrato REST/JSON; a segunda deve enviar o JWT como Bearer e ter sua autorização aplicada pelo backend. Confirmar que `NEXT_PUBLIC_API_URL` e `CORS_ORIGIN` correspondem às origens usadas e que o frontend não acessa diretamente o PostgreSQL.

---

_Gerado pelo estudo dirigido de Arquitetura de Software · ADS020 · 2026.2._
