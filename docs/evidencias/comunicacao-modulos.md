# Evidencia da comunicacao entre modulos

## Data da execucao

24/11/2026

## Health checks da composicao Docker

Os tres componentes foram iniciados pela composicao Docker e consultados diretamente em sua porta publicada:

```text
GET http://localhost:3334/health
HTTP 200
{"status":"ok","workers":4}

GET http://localhost:3333/health
HTTP 200
{"status":"ok"}
```

## Frontend/Backend/Recommendation Service

O fluxo implementado e:

```text
Frontend
  -> GET /api/recomendacoes?productId=<id>
  -> Backend Express
  -> POST /recommendations
  -> Recommendation Service HTTP
  -> Worker Threads
  <- IDs ranqueados
  <- lista de produtos
  <- resposta ao frontend
```

## Evidencia reproduzivel

O comando abaixo inicia o serviço local, envia requisições HTTP reais nos modos sequencial e paralelo e registra os resultados:

```powershell
cd backend
npm run benchmark:recommendations
```

O log da execucao de benchmark esta em [benchmark-recomendacoes.md](benchmark-recomendacoes.md).
