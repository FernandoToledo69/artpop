# Revisão crítica de código — TC02

## História analisada

**TC02 — Atualização de disponibilidade de estoque (HU 2).**

O fluxo permite que o artesão altere a quantidade de uma obra publicada,
inclusive para zero. Quando a alteração é confirmada, o valor é persistido e a
vitrine passa a impedir novas compras da obra esgotada.

## Code smell identificado

O serviço `frontend/src/services/api/produtos.service.ts` repetia a mesma
responsabilidade de persistência em vários pontos: criação, migração de dados
legados, exclusão, atualização de estoque e edição de produto. Cada trecho
montava a lista e chamava diretamente `localStorage.setItem` com a mesma chave.

Essa duplicação não impedia o funcionamento da TC02, mas reduzia a coesão do
serviço e aumentava o custo de manutenção. Uma mudança futura no mecanismo de
persistência poderia exigir alterações em vários fluxos, aumentando o risco de
inconsistências entre a atualização de estoque e as demais operações do
catálogo.

## Decisão e técnica aplicada

Foi aplicada a técnica **Extract Method**, criando `saveProducts`. O método
concentra a gravação da coleção de produtos, enquanto cada operação passa a
ficar responsável apenas por calcular o novo estado que deve ser salvo.

A refatoração foi escolhida porque é pequena, reduz duplicação e melhora a
coesão sem introduzir uma nova camada ou alterar a API pública do serviço. A
regra de negócio da TC02 foi preservada: estoque zero continua sendo aceito,
persistido e refletido no catálogo, impedindo que a obra seja adicionada ao
carrinho.

## Validação e riscos

O teste existente de atualização de estoque verifica que:

- o estoque zero é salvo;
- o catálogo passa a exibir estoque zero;
- o valor persistido no armazenamento é zero;
- uma nova tentativa de adicionar a obra ao carrinho não aumenta o carrinho;
- a criação do pedido é bloqueada quando não há estoque disponível.

Também foram preservadas as mensagens, os retornos e a estrutura dos produtos.
O risco residual é o mesmo da implementação anterior: o projeto utiliza
`localStorage` como persistência de demonstração, portanto a solução não
substitui uma transação no backend em um ambiente de produção.
