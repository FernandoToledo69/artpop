# artpop

Marketplace de arte autoral e artesanato, criado para aproximar pessoas interessadas em peças feitas à mão dos artesãos que as produzem.

## Descrição

O artpop organiza em uma vitrine digital obras autorais de diferentes categorias, técnicas e municípios. A pessoa visitante pode descobrir peças, pesquisar por nome, técnica ou localidade, filtrar o catálogo e consultar os detalhes de cada produto. O artesão pode apresentar seu perfil, publicar novos anúncios e gerenciar o estoque. O comprador pode adicionar produtos ao carrinho e simular a compra.

A aplicação resolve o problema da pouca visibilidade de pequenos produtores e da dificuldade de encontrar arte local em um único lugar. Ao reunir catálogo, contexto sobre a peça e informações do artesão, o projeto facilita a descoberta e valoriza o trabalho manual.

> **Estado atual:** a experiência funcional disponível é um protótipo frontend com Fake API estruturada via `localStorage` e dados mockados. O backend, banco de dados e integrações listados na estrutura do projeto ainda não possuem implementação executável.

## Integrantes

| Integrante | Perfil | Foto |
| --- | --- | --- |
| Davi Lucas | [github.com/davi081dev](https://github.com/davi081dev) | [![Davi Lucas](https://github.com/davi081dev.png?size=96)](https://github.com/davi081dev) |
| Hugo Mendonça | [github.com/BRKHugz](https://github.com/BRKHugz) | [![Hugo Mendonça](https://github.com/BRKHugz.png?size=96)](https://github.com/BRKHugz) |
| Luiz Fernando Ramos de Toledo | [github.com/FernandoToledo69](https://github.com/FernandoToledo69) | [![Luiz Fernando Ramos de Toledo](https://github.com/FernandoToledo69.png?size=96)](https://github.com/FernandoToledo69) |
| Michel dos Santos Serpa | [github.com/serpamichel](https://github.com/serpamichel) | [![Michel dos Santos Serpa](https://github.com/serpamichel.png?size=96)](https://github.com/serpamichel) |

## Tecnologias utilizadas

### Frontend

- Next.js 14.2.15
- React 18.3.1
- TypeScript 5.6.3
- CSS global próprio e App Router do Next.js

### Persistência e experiência atual

- `localStorage` do navegador para armazenar perfil do artesão, obras publicadas e carrinho durante o protótipo.
- Dados mockados para demonstrar o catálogo inicial.
- `FileReader` para transformar imagens selecionadas em Data URLs no navegador.

### Estrutura prevista

O diretório `backend/` contém pastas preparadas para controllers, services, repositories, Prisma, autenticação, cache, filas, validação e documentação Swagger. Porém, os arquivos dessa camada estão vazios no estado atual. Portanto, não há banco de dados, autenticação, Redis, filas ou API REST funcionando para configurar ou consumir.

## Como executar localmente

### Frontend

Pré-requisitos: Node.js 18.17 ou superior e npm.

```bash
cd frontend
npm install
npm run dev
```

Depois, abra [http://localhost:3000](http://localhost:3000).

Para gerar e executar a versão de produção:

```bash
cd frontend
npm run build
npm start
```

### Backend

O backend ainda não possui `package.json`, scripts ou código executável. Por isso, não há um comando de inicialização disponível nesta versão. A estrutura está reservada para a implementação futura da API.

## Variáveis de ambiente

O protótipo frontend não exige variáveis de ambiente: os dados são mockados ou armazenados localmente no navegador.

O arquivo [`.env.example`](.env.example) registra a configuração opcional que poderá ser usada quando a API for implementada:

```dotenv
# URL base da API. Não é necessária no protótipo atual.
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Para usar o arquivo localmente, copie-o para `.env.local` dentro de `frontend/`:

```bash
copy ..\.env.example .env.local
```

No PowerShell, o mesmo comando pode ser executado a partir do diretório `frontend`. A variável ainda não é consumida pelos serviços atuais.

## Funcionalidades implementadas

### Vitrine e descoberta de produtos

- Vitrine inicial com obras demonstrativas e obras publicadas pelo artesão.
- Banner de destaque ("Encontre uma peça com alma") exibido apenas na página inicial sem filtros ativos — ocultado automaticamente ao buscar ou filtrar.
- Busca por nome da obra, técnica ou município.
- Filtros por município, categoria, técnica e ordenação (mais recentes, mais antigas, menor preço, maior preço, ordem alfabética).
- Contagem dinâmica de resultados encontrados com texto acessível.

### Página de detalhes da obra

- Exibição completa: imagem principal, galeria de imagens adicionais, título, descrição, preço, técnica, município e artesão.
- Aviso de **"último item disponível"** (em destaque vermelho) quando o estoque for igual a 1.
- Seletor de quantidade integrado ao botão de "Adicionar ao carrinho", respeitando o limite do estoque disponível.
- Botão de aplauso (👏) posicionado no canto superior direito da imagem, com tooltip "aplaudir" ao passar o mouse, idêntico ao da vitrine.
- Seção de informações do artesão com link para o perfil.
- Formulário de comentários e avaliações.

### Carrinho de compras

- Adicionar itens ao carrinho com quantidade definida pelo usuário.
- Remover itens individualmente.
- Ajustar quantidade diretamente no carrinho, respeitando o estoque disponível.
- Agrupamento de itens por artesão.
- Cálculo de subtotal em tempo real.
- Campo para inserção de cupom de desconto.
- Cálculo de frete simulado por CEP (PAC e Sedex) com valores dinâmicos por região.
- Estado vazio com chamada para explorar obras.

### Perfil e painel do artesão

- Visualização e edição dos dados do perfil (nome, cidade, bio e foto de avatar).
- Publicação de obras com validação de campos obrigatórios (título, categoria, técnica, descrição, preço, estoque e foto principal).
- Upload local de foto principal e até quatro fotos adicionais.
- Listagem das obras publicadas com busca por nome, categoria ou técnica.
- Controle de estoque: atualização de quantidade com confirmação e feedback visual.
- Links **"Editar"** e **"Ver anúncio"** alinhados lado a lado em cada obra listada, para editar ou acessar a página pública do produto.

### Navegação e experiência

- Títulos de página HTML únicos e descritivos para cada rota (ex.: "Carrinho | artpop", "Detalhes da Obra | artpop").
- Página 404 personalizada com mensagem amigável e ilustração do cacto, no lugar da tela genérica de erro.
- Breadcrumbs nas páginas internas para facilitar a navegação.
- Layout responsivo: funciona em desktop e mobile.
- Painel administrativo com estrutura inicial de rotas.

### Estrutura de dados (Fake API)

- Camada de `services` organizada por domínio em `src/services/api/`:
  - `produtos.service.ts` — CRUD de obras via `localStorage`.
  - `carrinho.service.ts` — Leitura, adição, remoção e atualização de itens do carrinho.
  - `usuarios.service.ts` — Leitura e atualização do perfil do artesão.
  - `favoritos.service.ts` — Controle de aplausos/favoritos.
- Dados mockados em `src/mocks/products.ts` simulando obras de diferentes artesãos, cidades e categorias.
- Tipos e interfaces centralizados em `src/types/` para os principais recursos (Produto, CartItem, etc.).
- Estrutura preparada para substituição da Fake API pelo backend real na Avaliação 2, sem necessidade de reescrever a estrutura principal.

## Rotas da aplicação

| Rota | Descrição |
| --- | --- |
| `/` | Página inicial com vitrine e filtros |
| `/produtos/[id]` | Detalhes de um produto |
| `/artesoes` | Listagem de artesãos |
| `/artesoes/[id]` | Perfil público de um artesão |
| `/carrinho` | Carrinho de compras |
| `/pedidos` | Histórico de pedidos do comprador |
| `/pedidos/[id]` | Detalhes de um pedido |
| `/aplausos` | Obras aplaudidas pelo usuário |
| `/painel-artesao` | Painel inicial do artesão |
| `/painel-artesao/anunciar` | Formulário para publicar obra |
| `/painel-artesao/editar/[id]` | Edição de obra publicada |
| `/painel-artesao/pedidos` | Pedidos recebidos pelo artesão |
| `/admin` | Painel administrativo (estrutura inicial) |

## Rotas da API

Não há endpoints HTTP implementados nesta versão. As pastas e arquivos de controllers, services e routes em `backend/src/` são apenas a estrutura planejada.

As operações atualmente disponíveis acontecem no cliente:

| Operação | Serviço | Armazenamento |
| --- | --- | --- |
| Listar e filtrar obras | `MarketplaceProducts.tsx` | Mocks + `localStorage` (`origem:products`) |
| Publicar obra | `produtos.service.ts` | `localStorage` (`origem:products`) |
| Atualizar estoque | `produtos.service.ts` | `localStorage` (`origem:products`) |
| Ler e atualizar perfil | `usuarios.service.ts` | `localStorage` (`origem:artisan-profile`) |
| Adicionar/remover do carrinho | `carrinho.service.ts` | `localStorage` (`origem:cart`) |
| Calcular frete (simulado) | `carrinho.service.ts` | Cálculo local por CEP |
| Aplausos/favoritos | `favoritos.service.ts` | `localStorage` (`origem:favorites`) |

Quando a API for implementada, esta seção deve ser atualizada com endpoints, autenticação, parâmetros e exemplos reais de requisição e resposta.

## Deploy

Não há links de deploy publicados informados no repositório. Para publicar o frontend, uma opção compatível é configurar o projeto `frontend/` em uma plataforma que suporte Next.js, como Vercel, executando `npm run build` durante a etapa de build.

## Evidências

- O catálogo inicial é carregado com obras demonstrativas no componente `MarketplaceProducts`.
- A publicação de uma obra exige os campos obrigatórios e mostra a mensagem de sucesso no próprio formulário.
- A imagem principal e imagens adicionais são convertidas localmente para Data URLs.
- O campo de quantidade no botão de compra respeita o estoque disponível e bloqueia quando esgotado.
- O banner de destaque desaparece automaticamente ao buscar ou filtrar obras.
- O comando de produção do frontend é `npm run build`.
- Não há testes automatizados, prints ou vídeo versionados no repositório até o momento.
