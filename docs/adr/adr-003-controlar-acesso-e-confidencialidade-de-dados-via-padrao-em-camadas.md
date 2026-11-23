# ADR-003: Controlar acesso e confidencialidade de dados via padrão em camadas

- **Status:** Aceita
- **Data:** 2026-11-23
- **Autor:** LUIZ FERNANDO RAMOS DE TOLEDO (lfrt@cesar.school)
- **Turma:** Embarque (segundas)
- **Projeto:** Origem · marketplace da economia criativa e do artesanato de Pernambuco

## Contexto

O sistema reúne diferentes perfis que manipulam dados sensíveis ou privados, como informações cadastrais de usuários, dados pessoais, endereço e pedidos. Em um operação normal, um usuário não autenticado ou com perfil comum não pode acessar dados privados de terceiros, manipulando ID na URL em uma requisição GET. Além disso, o projeto tem restrições concretas como prazo de um semestre, equipe pequena dividindo tempo com outras disciplinas e um stack definida com Desenvolvimento Web

## Preocupações

Confidencialidade, controle de acesso, exposição de dados sensíveis, testabilidade, prazo e infraestrutura limitada

## Decisão

Adotaremos o padrão arquitetural em camadas no backend do origem para centralizar a autenticação, a autorização e a filtragem de campos sensíveis antes do acesso aos dados.

## Justificativa

Ao estruturar o sistema em camadas, garantimos que nenhuma requisição chege à camada de persistência ou devolva registros sem passar antes pela faixa de validação de token, bloqueando 100% dessas tentativas em menos de 200ms com 0 bytes de dados confidenciais expostos.

## Consequências

Ganhamos centralização clara das regras de autenticação, autorização e proteção de dados confidenciais; menor risco de vazamento de dados por rotas esquecidas sem validação; reaproveitamento direto da stack e do modelo de dados já definidos. 
Aceitamos o custo de dependência vertical e possível acoplamento entre as camadas, o risco de uma falha ou regra mal configurada na camada de autorização impactar múltiplas rotas ao mesmo tempo, uma leve sobrecarga de verificação em cada chamada e a necessidade de disciplina constante para que nenhuma rota acesse dados pulando a validação de propriedade.

## Alternativas consideradas

Orientado a eventos: Descartado porque, apesar de útil para comunicação assíncrona entre produtores e consumidores, aumentaria a complexidade de coordenação, rastreabilidade e depuração do controle de acesso síncrono na API.

## Rastreabilidade

**Atributo de qualidade:** Segurança (security) · Confidencialidade

**Cenário que originou a decisão:**

> Sistema em operação normal, usuário autenticado com perfil comum Tenta acessar diretamente via requisição GET um endpoint da API que retorna dados cadastrais privados de outro usuário, manipulando o ID na URL Camada de API/backend responsável pela autenticação, autorização e consulta de dados de usuários e moderação.. O sistema intercepta a requisição antes de consultar ou expor qualquer dado sensível, bloqueia o acesso retornando o status HTTP 403 forbidden, não vaza nenhuma informação no corpo da resposta e registra uma tentativa de acesso negado em log., 100% das tentativas de acesso não autorizados são bloqueadas em menos de 200ms, com 0 bytes de dados confidenciais retornados payload da resposta..

**Padrão arquitetural adotado:** Camadas

**Táticas empacotadas:** Encapsular responsabilidades por faixa; Usar intermediário entre camadas

Módulos de autenticação/Usuários; Perfil do artesão e moderação de cadastros no repositório; rotas protegidas de consulta cadastral.

## Verificação

- **Teste do cenário:** Teste automatizado de integração na API, que envia requisições GET para endpoints de dados privados de outros usuários e para rotas de moderação usando: Requisição sem token; token válido de um usuário comum

---

_Gerado pelo estudo dirigido de Arquitetura de Software · ADS020 · 2026.2._
