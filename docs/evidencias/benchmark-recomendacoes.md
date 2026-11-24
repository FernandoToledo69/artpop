Artpop - evidencias do benchmark de recomendacoes
Ambiente: win32 x64; Node v24.14.0; CPUs logicas=12
Dados: 40000 produtos sinteticos; aquecimento=1 chamada por modo; repeticoes=5; limite=8

## Log da comunicação HTTP
HTTP GET /health -> 200
HTTP POST /recommendations -> 200 mode=sequential
HTTP POST /recommendations -> 200 mode=parallel
Workers paralelos registrados: 4
Módulos envolvidos: benchmark -> Recommendation Service

## Resultados por repetição

| Repeticao | Sequencial HTTP (ms) | Sequencial pontuacao (ms) | Paralelo HTTP (ms) | Paralelo pontuacao (ms) |
|---:|---:|---:|---:|---:|
| 1 | 428.73 | 246.95 | 562.05 | 308.33 |
| 2 | 627.97 | 346.49 | 561.74 | 199.84 |
| 3 | 737.64 | 315.82 | 448.69 | 198.34 |
| 4 | 568.53 | 258.43 | 397.31 | 177.12 |
| 5 | 461.45 | 258.94 | 387.06 | 176.30 |

| Modo | Workers | Latencia HTTP mediana (ms) | Calculo do score mediano (ms) |
|---|---:|---:|---:|
| Sequencial | 1 | 568.53 | 258.94 |
| Paralelo | 4 | 448.69 | 198.34 |
Speedup HTTP: 1.27x
Speedup pontuacao: 1.31x
Resultados equivalentes: sim (8 recomendacoes)
