# ADR-004: Adotar arquitetura escalável por réplicas stateless e serviços de apoio

- **Status:** Proposta
- **Data:** 2026-11-23
- **Autor:** Michel Serpa
- **Turma:** Embarque Digital
- **Projeto:** artpop · marketplace da economia criativa e do artesanato de Pernambuco

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

### Benefícios

- Permite aumentar a capacidade adicionando réplicas da API ou trabalhadores das filas.
- Mantém a resposta a requisições HTTP independente da origem da instância que recebe o acesso.
- Reduz consultas repetidas ao banco por meio de cache compartilhado.
- Remove processamento pesado do caminho síncrono das requisições.
- Facilita testes de carga, observabilidade e implantação progressiva.

### Custos e compromissos

- Introduz latência de rede em cada operação entre navegador e API.
- Exige um balanceador de carga e a execução de múltiplas instâncias da API.
- Faz da API e do PostgreSQL compartilhado pontos centrais de contenção e de falha.
- Exige balanceador de carga, Redis, filas e configuração de múltiplos ambientes.
- Introduz necessidade de invalidação de cache e tratamento de falhas de cache ou filas.
- Requisições repetidas podem produzir consistência temporária entre banco e cache.
- O PostgreSQL pode tornar-se o próximo gargalo quando o volume de escritas ou transações crescer.
- A infraestrutura adicionada aumenta os custos operacionais e exige monitoramento, versionamento e testes de recuperação.

Em situações de falha do Redis, a API deve continuar funcionando consultando o PostgreSQL. Em tarefas enfileiradas, falhas devem gerar novas tentativas controladas, sem perda silenciosa das mensagens.

## Alternativas consideradas

### Escala vertical

Manter uma única instância da API e aumentar recursos da máquina poderia atender cargas iniciais com menor complexidade. A alternativa foi parcialmente aceita como medida temporária, mas não é suficiente como estratégia principal: a capacidade continuará limitada por um único nó e por eventuais reinícios ou falhas.

### Microsserviços desde o início

Separar catálogo, pedidos, estoque e usuários em serviços independentes permitiria escalamento específico de cada domínio. Entretanto, dividir o sistema nesta etapa exigiria integração, observabilidade distribuída, automação de implantação e operação de múltiplos bancos ou contratos. Considerando o tamanho da equipe e os recursos disponíveis, essa complexidade não é justificável.

### Orientado a Eventos como padrão principal

Foi considerado para processamento assíncrono de imagens e atualização de indicadores, pois permitiria publicar eventos e adicionar consumidores sem alterar o fluxo principal. Porém, adotá-lo como padrão central acrescentaria consistência eventual, barramentos ou filas, rastreabilidade distribuída e maior dificuldade de depuração para um projeto que ainda não precisa dessa desacoplamento em todo o domínio.

### CQRS

Foi descartado porque o volume atual não justifica separar modelos de leitura e escrita ou manter uma projeção quase sempre assíncrona. Essa alternativa duplicaria modelos e bases de dados, além de introduzir consistência eventual no catálogo.

### Replicação da API sem cache ou filas

Replicar a API apenas distribuindo requisições reduziria parte da carga, mas manteria consultas repetidas no PostgreSQL e impediria o processamento assíncrono de tarefas pesadas. Por isso, cache e filas podem ser adotados como componentes de apoio ao padrão Cliente-servidor.

## Rastreabilidade

**Atributo de qualidade:** Flexibilidade · Escalabilidade

**Cenário que originou a decisão:**

> Durante uma operação normal de publicidade, uma campanha promocional aumenta o número de requisições ao catálogo de 50 para 500 requisições por segundo em até 10 minutos. O backend do Projeto Origem recebe a carga por múltiplas instâncias atrás de um balanceador, mantém pelo menos 95% das respostas do catálogo entre 200 ms e 800 ms e mantém o percentual de erros HTTP 5xx abaixo de 1%, durante 30 minutos de teste.

**Padrão arquitetural adotado:** Cliente-servidor

**Táticas empacotadas:** Centralizar regra e dado no servidor; Autenticar e autorizar na borda; Limitar a exposição da API; Replicar o servidor para escalar

**Fluxo funcional:** Navegação e busca no catálogo, publicação de produtos, processamento de imagens e atualização de indicadores.

**Módulos relacionados:**

- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/routes/produtos.routes.ts`
- `backend/src/services/produtos.service.ts`
- `backend/src/repositories/produtos.repository.ts`
- `backend/src/cache/catalog.cache.ts`
- `backend/src/cache/redis.client.ts`
- `backend/src/jobs/processImages.job.ts`
- `backend/src/jobs/updateIndicators.job.ts`
- `backend/src/queues/order.queue.ts`
- `backend/src/queues/notification.queue.ts`
- `backend/src/database/prisma/schema.prisma`
- `docker-compose.yml`

## Verificação

Executar um teste de carga automatizado com carga progressiva contra o ambiente de homologação:

1. iniciar pelo menos duas réplicas da API;
2. executar busca e listagem do catálogo com 50 requisições por segundo durante 5 minutos;
3. aumentar para 500 requisições por segundo durante 10 minutos;
4. manter 500 requisições por segundo por mais 30 minutos;
5. coletar latência p95, taxa de erros 5xx, utilização de CPU e memória, consultas ao banco e taxa de acerto do cache;
6. remover uma réplica durante a carga e verificar se o balanceador redistribui as requisições sem interrupção do catálogo;
7. derrubar temporariamente o Redis e confirmar que as operações do catálogo continuam disponíveis via PostgreSQL;
8. enviar trabalhos de processamento de imagens e verificar que a fila completa os itens sem aumentar significativamente a latência das requisições HTTP.

### Critérios de aceite

- Pelo menos 95% das respostas do catálogo devem ficar entre 200 ms e 800 ms.
- A taxa de erros HTTP 5xx deve permanecer abaixo de 1%.
- Nenhum trabalho enfileirado deve ser perdido após uma falha controlada do consumidor.
- A remoção de uma réplica não deve interromper o catálogo.
- O cache não deve ser obrigatório para o funcionamento das operações críticas.

---

_Gerado pelo estudo dirigido de Arquitetura de Software · ADS020 · 2026.2._
