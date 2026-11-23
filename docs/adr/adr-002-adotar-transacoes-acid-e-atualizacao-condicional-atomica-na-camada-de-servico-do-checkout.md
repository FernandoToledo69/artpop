# ADR-002: Adotar transações ACID e atualização condicional atômica na camada de serviço do checkout

- **Status:** Aceita
- **Data:** 2026-11-22
- **Autor:** HUGO VINICIUS DE LIMA MENDONCA (hvlm@cesar.school)
- **Turma:** Embarque (segundas)
- **Projeto:** Origem · marketplace da economia criativa e do artesanato de Pernambuco

## Contexto

O Projeto artpop é um marketplace da economia criativa de Pernambuco desenvolvido por uma equipe pequena de estudantes no prazo de um semestre, conciliando outras disciplinas em paralelo e sem orçamento para infraestrutura (hospedagem gratuita e limitada). A stack foi acordada com Desenvolvimento Web(TypeScript, Express, Prisma ORM e banco relacional). Como grande parte do catálogo é composta por peças artesanais únicas ou de tiragem baixíssima, a prioridade no fechamento de pedido é garantir consistência total dos dados, evitando vendas duplicadas ou registros parciais sob acessos simultâneos.

## Preocupações

Confiabilidade, integridade transacional, concorrência, tempo de resposta, custo de infraestrutura

## Decisão

Encapsular todo o fluxo de fechamento de pedido na camada de serviço (orders.service.ts) dentro de uma transação atômica explícita (prisma.$transaction) combinada com atualização condicional de saldo (quantity >= requestedQuantity). Caso outra requisição já tenha consumido a última unidade da peça, a transação sofre rollback imediato e retorna erro HTTP 400 para que a interface atualize o carrinho do comprador.

## Justificativa

Ao concentrar a validação de disponibilidade, a baixa do saldo da peça e a gravação do pedido em uma única transação atômica no banco relacional via camada de serviço, o sistema elimina race conditions quando dois compradores finalizam a mesma peça única simultaneamente. A atualização condicional garante que apenas a primeira transação valide a condição de saldo e conclua a compra, enquanto a segunda é rejeitada de forma controlada em menos de 2 segundos sem exigir infraestrutura externa paga.

## Consequências

O que se ganha: 100% de integridade e consistência dos pedidos, eliminação de vendas duplicadas de peças únicas, resposta determinística ao comprador e aproveitamento nativo da stack (Express + Prisma) sem custo adicional de servidor.
O que se perde: Adiciona uma latência marginal pela passagem sequencial entre camadas e gera lock contention no banco relacional caso muitos usuários disputem exatamente a mesma peça ao mesmo tempo, exigindo tratamento explícito de conflito no frontend do carrinho.

## Alternativas consideradas

Arquitetura Orientada a Eventos: Descartada porque violaria as restrições de orçamento e prazo e introduziria consistência eventual, impedindo a confirmação imediata ao comprador de que uma peça única foi garantida no momento do clique.

## Rastreabilidade

**Atributo de qualidade:** Confiabilidade · Tolerância a falhas

**Cenário que originou a decisão:**

> Quando dois compradores autenticados submetem simultaneamente o fechamento de pedido contendo a última unidade de uma mesma peça artesanal durante operação normal na hospedagem limitada do Projeto Origem, o backend de pedidos deve processar a transação de forma atômica, concluindo 100% apenas a primeira solicitação válida e rejeitando a segunda com mensagem clara de indisponibilidade em até 2 segundos, garantindo zero vendas duplicadas ou registros inconsistentes no banco de dados.

**Padrão arquitetural adotado:** Camadas

**Táticas empacotadas:** Encapsular responsabilidades por faixa; Usar intermediário entre camadas

Módulos: 
backend/src/routes/orders.routes.ts
backend/src/controllers/orders.controller.ts
backend/src/services/orders.service.ts
frontend/src/app/carrinho/page.tsx
frontend/src/services/carrinho.service.ts

Fluxo funcional: Montagem de carrinho e fechamento de pedido.

## Verificação

- **Teste do cenário:** Teste de integração automatizado disparando simultaneamente duas requisições autenticas contendo a última unidade de uma mesma peça artesanal.
O teste valida que:
(1) exatamente uma requisição retorna HTTP 201 Created;
(2) a segunda retorna HTTP 409 Conflict;
(3) o saldo final da peça no banco fica exatamente igual a 0 com apenas 1 registro de pedido criado;
(4) ambas as respostas ocorrem em menos de 2 segundos.

---

_Gerado pelo estudo dirigido de Arquitetura de Software · ADS020 · 2026.2._
