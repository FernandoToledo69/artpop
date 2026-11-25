# API REST do artpop

A API executa em `http://localhost:3333` e utiliza Express, Prisma ORM e PostgreSQL.

## Autenticação

Cadastre ou autentique uma conta em `/api/auth/register` ou `/api/auth/login`. As respostas incluem um JWT de acesso, válido por 15 minutos. O refresh token é armazenado como hash no banco e enviado em cookie `HttpOnly`, com validade absoluta de 30 dias. Em produção, configure HTTPS e `NODE_ENV=production` para habilitar `Secure` e `SameSite=None`.

```http
Authorization: Bearer <token>
```

O frontend renova o JWT automaticamente quando uma chamada protegida retorna `401`, usando `POST /api/auth/refresh` e repetindo a chamada original. O endpoint de refresh utiliza o cookie automaticamente; não envie o refresh token no corpo ou em headers. `POST /api/auth/logout` revoga a sessão atual e remove o cookie.

## Recursos

| Método | Rota | Acesso |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Público |
| `POST` | `/api/auth/login` | Público |
| `POST` | `/api/auth/refresh` | Cookie de refresh |
| `POST` | `/api/auth/logout` | Cookie de refresh |
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