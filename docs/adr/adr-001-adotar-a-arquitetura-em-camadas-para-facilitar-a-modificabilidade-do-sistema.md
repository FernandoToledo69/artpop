# ADR-001: Adotar a Arquitetura em Camadas para facilitar a modificabilidade do sistema.

- **Status:** Aceita
- **Data:** 2026-11-22
- **Autor:** DAVI LUCAS DA SILVA PINHEIRO (dlsp@cesar.school)
- **Turma:** Embarque (segundas)
- **Projeto:** Origem · marketplace da economia criativa e do artesanato de Pernambuco

## Contexto

O Projeto Integrador Origem é desenvolvido por uma equipe pequena de estudantes e possui prazo de um semestre. Como o sistema pode receber novas funcionalidades e mudanças nas regras de negócio, é importante que o código seja organizado e permita realizar alterações com facilidade. Funcionalidades como o controle de estoque, o catálogo de obras e o carrinho de compras precisam funcionar corretamente mesmo após futuras modificações.

## Preocupações

Modificabilidade, custo de mudança, testabilidade, prazo e facilidade de manutenção.

## Decisão

Será adotada a Arquitetura em Camadas para separar a interface, as regras de negócio e o acesso aos dados. Essa organização busca facilitar futuras alterações e reduzir o risco de que mudanças em uma funcionalidade prejudiquem outras partes do sistema.

## Justificativa

A arquitetura em camadas foi escolhida porque permite separar a interface, as regras de negócio e o acesso aos dados, facilitando a manutenção e as futuras alterações no sistema. Com essa organização, mudanças na regra de atualização do estoque podem ser realizadas de forma mais isolada, reduzindo o risco de afetar outras funcionalidades, como o catálogo e o carrinho de compras. Dessa forma, a decisão atende ao cenário de modificabilidade proposto.

## Consequências

Com essa arquitetura, o sistema ganha uma melhor organização do código, facilitando a manutenção e as futuras alterações. A separação das responsabilidades também ajuda a reduzir a duplicação de código e diminui o risco de problemas em outras funcionalidades durante uma mudança. Por outro lado, será necessário criar mais arquivos e estruturas para organizar as camadas, além de exigir que a equipe siga essa divisão corretamente para evitar dependências desnecessárias.

## Alternativas consideradas

Uma das alternativas consideradas foi a arquitetura de microsserviços, que permitiria separar funcionalidades como estoque, catálogo e carrinho em serviços independentes. Porém, essa opção foi descartada porque exigiria mais estrutura e trabalho para desenvolver, integrar e manter os serviços. Considerando que o projeto possui uma equipe pequena, prazo limitado e poucos recursos disponíveis, essa alternativa poderia trazer uma complexidade maior do que a necessária. Por isso, a arquitetura em camadas foi considerada mais adequada para o Projeto Origem.

## Rastreabilidade

**Atributo de qualidade:** Manutenibilidade · Modificabilidade

**Cenário que originou a decisão:**

> Em ambiente de desenvolvimento, fora de operação., um desenvolvedor da equipe. Precisa alterar a regra de atualização do estoque de produtos. O serviço responsável pelo gerenciamento de produtos e estoque.. O sistema A arquitetura permite realizar a alteração sem comprometer o funcionamento do catálogo e do carrinho de compras., Alteração concluída em até 2 horas, afetando no máximo 2 módulos, com todos os testes relacionados à funcionalidade passando..

**Padrão arquitetural adotado:** Camadas

**Táticas empacotadas:** Encapsular responsabilidades por faixa; Restringir dependências a uma direção

História de Usuário HU2, Caso de Teste TC02 (atualização da disponibilidade de estoque, incluindo o cenário de estoque zero) e serviço de produtos localizado em frontend/src/services/api/produtos.service.ts.

## Verificação

- **Teste do cenário:** Executar os testes unitários do serviço de produtos após as alterações na lógica de estoque, verificando se a atualização para zero funciona corretamente, se o produto aparece como esgotado e se não pode ser adicionado novamente ao carrinho. Todos os testes relacionados à funcionalidade devem passar, sem comprometer o funcionamento do catálogo e do carrinho. Também deve ser verificado se a alteração foi realizada em até 2 horas e afetou, no máximo, 2 módulos.

---

_Gerado pelo estudo dirigido de Arquitetura de Software · ADS020 · 2026.2._
