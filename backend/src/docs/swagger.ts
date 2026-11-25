export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Artpop API',
    version: '1.0.0',
    description: 'API REST do marketplace de arte autoral e artesanato.',
  },
  servers: [{ url: 'http://localhost:3333/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': { get: { security: [], summary: 'Estado da API', responses: { 200: { description: 'API operacional' } } } },
    '/auth/register': { post: { security: [], summary: 'Cadastrar usuário', responses: { 201: { description: 'Usuário criado' } } } },
    '/auth/login': { post: { security: [], summary: 'Autenticar usuário', responses: { 200: { description: 'Token JWT e usuário' } } } },
    '/auth/refresh': { post: { security: [], summary: 'Renovar token de acesso usando o cookie de refresh', responses: { 200: { description: 'Novo token de acesso' }, 401: { description: 'Sessão expirada' } } } },
    '/auth/logout': { post: { security: [], summary: 'Revogar a sessão atual', responses: { 204: { description: 'Sessão encerrada' } } } },
    '/produtos': { get: { security: [], summary: 'Listar produtos', responses: { 200: { description: 'Catálogo' } } }, post: { summary: 'Criar produto', responses: { 201: { description: 'Produto criado' } } } },
    '/produtos/{id}': { get: { security: [], parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Produto' } } } },
    '/carrinho': { get: { summary: 'Listar carrinho', responses: { 200: { description: 'Itens' } } }, delete: { summary: 'Limpar carrinho', responses: { 204: { description: 'Carrinho vazio' } } } },
    '/artesoes': { get: { security: [], summary: 'Listar artesãos', responses: { 200: { description: 'Artesãos' } } } },
    '/admin/artesaos/pendentes': { get: { summary: 'Listar cadastros de artesãos pendentes', responses: { 200: { description: 'Fila de curadoria' } } } },
    '/admin/artesaos/{id}/moderacao': { patch: { summary: 'Aprovar ou reprovar cadastro de artesão', responses: { 200: { description: 'Cadastro moderado' }, 409: { description: 'Cadastro já moderado' }, 503: { description: 'SMTP não configurado para reprovação' } } } },
    '/pedidos': { get: { summary: 'Listar pedidos', responses: { 200: { description: 'Pedidos do usuário ou todos para admin' } } } },
    '/pedidos/checkout': { post: { summary: 'Finalizar compra', responses: { 201: { description: 'Pedido criado' } } } },
    '/usuarios/perfil': { get: { summary: 'Obter perfil', responses: { 200: { description: 'Perfil' } } }, patch: { summary: 'Atualizar perfil', responses: { 200: { description: 'Perfil atualizado' } } } },
    '/avaliacoes': { get: { security: [], summary: 'Listar avaliações', responses: { 200: { description: 'Avaliações' } } }, post: { summary: 'Criar avaliação', responses: { 201: { description: 'Avaliação criada' } } } },
    '/recomendacoes': { get: { security: [], summary: 'Recomendar produtos', responses: { 200: { description: 'Produtos recomendados' } } } },
    '/admin/indicadores': { get: { summary: 'Indicadores administrativos', responses: { 200: { description: 'Indicadores' } } } },
  },
};