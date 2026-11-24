Artpop - evidencias do benchmark de recomendacoes
Ambiente: win32 x64; Node v24.14.0; CPUs logicas=12
Dados: 40000 produtos sinteticos; aquecimento=1 chamada por modo; repeticoes=5; limite=8

| Repeticao | Sequencial HTTP (ms) | Sequencial pontuacao (ms) | Paralelo HTTP (ms) | Paralelo pontuacao (ms) |
|---:|---:|---:|---:|---:|
| 1 | 601.60 | 313.81 | 1299.78 | 795.92 |
| 2 | 1362.32 | 650.92 | 980.83 | 329.02 |
| 3 | 1354.72 | 698.36 | 947.79 | 404.62 |
| 4 | 1299.38 | 708.19 | 1164.96 | 558.77 |
| 5 | 1075.84 | 511.64 | 501.27 | 184.56 |

| Modo | Workers | Latencia HTTP mediana (ms) | Calculo do score mediano (ms) |
|---|---:|---:|---:|
| Sequencial | 1 | 1299.38 | 650.92 |
| Paralelo | 4 | 980.83 | 404.62 |
Speedup HTTP: 1.32x
Speedup pontuacao: 1.61x
Resultados equivalentes: sim (8 recomendacoes)
