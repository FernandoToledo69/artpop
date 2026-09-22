# artpop

Marketplace de arte autoral e artesanato, criado para aproximar pessoas interessadas em peças feitas à mão dos artesãos que as produzem.

## Descrição

O artpop organiza em uma vitrine digital obras autorais de diferentes categorias, técnicas e municípios. A pessoa visitante pode descobrir peças, pesquisar por nome, técnica ou localidade, filtrar o catálogo e consultar os detalhes de cada produto. O artesão pode apresentar seu perfil e publicar novos anúncios com fotos, descrição, preço e estoque.

A aplicação resolve o problema da pouca visibilidade de pequenos produtores e da dificuldade de encontrar arte local em um único lugar. Ao reunir catálogo, contexto sobre a peça e informações do artesão, o projeto facilita a descoberta e valoriza o trabalho manual.

> **Estado atual:** a experiência funcional disponível é um protótipo frontend. O backend, banco de dados e integrações listados na estrutura do projeto ainda não possuem implementação executável.

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

- `localStorage` do navegador para armazenar perfil do artesão e obras publicadas durante o protótipo.
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

- Vitrine inicial com obras demonstrativas.
- Busca por nome da obra, técnica ou município.
- Filtros por município, categoria e técnica.
- Ordenação por obras mais recentes ou menor preço.
- Página de detalhes de uma obra.
- Perfil público e painel do artesão.
- Atualização dos dados do perfil do artesão no navegador.
- Formulário para publicar uma obra.
- Validação de título, categoria, técnica, descrição, preço, estoque e foto principal.
- Upload local de uma foto principal e até quatro fotos adicionais.
- Persistência local dos anúncios publicados e do perfil usando `localStorage`.
- Layout responsivo com identidade visual própria e imagens de marca em `frontend/public/`.

As páginas de login, cadastro, carrinho, pedidos e administração possuem entradas na estrutura do frontend, mas ainda não representam fluxos completos conectados a uma API.

## Rotas da API

Não há endpoints HTTP implementados nesta versão. As pastas e arquivos de controllers, services e routes em `backend/src/` são apenas a estrutura planejada.

As operações atualmente disponíveis acontecem no cliente:

| Operação | Local | Dados |
| --- | --- | --- |
| Listar e filtrar obras | `frontend/src/components/marketplace/MarketplaceProducts.tsx` | Dados demonstrativos + `localStorage` |
| Publicar obra | `frontend/src/services/produtos.service.ts` | `localStorage` (`origem:products`) |
| Ler e atualizar perfil | `frontend/src/services/api/usuarios.service.ts` | `localStorage` (`origem:artisan-profile`) |

Quando a API for implementada, esta seção deve ser atualizada com endpoints, autenticação, parâmetros e exemplos reais de requisição e resposta.

## Deploy

Não há links de deploy publicados informados no repositório. Para publicar o frontend, uma opção compatível é configurar o projeto `frontend/` em uma plataforma que suporte Next.js, como Vercel, executando `npm run build` durante a etapa de build.

## Evidências

- O catálogo inicial é carregado com obras demonstrativas no componente `MarketplaceProducts`.
- A publicação de uma obra exige os campos obrigatórios e mostra a mensagem de sucesso no próprio formulário.
- A imagem principal e imagens adicionais são convertidas localmente para Data URLs.
- O comando de produção do frontend é `npm run build`.
- Não há testes automatizados, prints ou vídeo versionados no repositório até o momento.
