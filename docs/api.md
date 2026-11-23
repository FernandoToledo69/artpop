# API REST do artpop

A API executa em `http://localhost:3333` e utiliza Express, Prisma ORM e PostgreSQL.

## Autenticação

Cadastre ou autentique uma conta em `/api/auth/register` ou `/api/auth/login`. As respostas incluem um token JWT. Envie o token em rotas protegidas:

```http
Authorization: Bearer <token>
```

## Recursos

| Método | Rota | Acesso |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Público |
| `POST` | `/api/auth/login` | Público |
| `GET` | `/api/produtos` | Público |
| `POST` | `/api/produtos` | Artesão |
| `PATCH/DELETE` | `/api/produtos/:id` | Proprietário/admin |
| `GET/PUT/DELETE` | `/api/carrinho` | Usuário autenticado |
| `POST` | `/api/pedidos/checkout` | Usuário autenticado |
| `GET/PATCH` | `/api/pedidos` | Usuário autenticado |
| `GET/PATCH` | `/api/usuarios/perfil` | Usuário autenticado |
| `GET/POST` | `/api/avaliacoes` | Pública/leitura, autenticada/escrita |
| `GET` | `/api/recomendacoes` | Público |
| `GET` | `/api/admin/indicadores` | Admin |

A descrição OpenAPI completa pode ser consultada em `GET /api/docs`.