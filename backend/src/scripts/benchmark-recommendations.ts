import { cpus } from 'node:os';
import { performance } from 'node:perf_hooks';
import { AddressInfo } from 'node:net';
import { RecommendationProduct, RecommendationMode } from '../recommendation-service/recommendation.types';
import { startRecommendationService } from '../recommendation-service/server';
import { requestRecommendations } from '../integrations/recommendation.client';

const itemCount = Number(process.env.BENCHMARK_ITEMS ?? 40_000);
const repetitions = Number(process.env.BENCHMARK_REPETITIONS ?? 5);
const vocabulary = [
  'ceramica', 'barro', 'feito', 'mao', 'pernambuco', 'artesanal', 'design', 'tradicao',
  'cores', 'forma', 'textura', 'autoral', 'recife', 'olinda', 'escultura', 'decoracao',
];

function createProduct(index: number): RecommendationProduct {
  const words = Array.from({ length: 14 }, (_, offset) =>
    vocabulary[(index * 7 + offset * 3) % vocabulary.length],
  ).join(' ');
  return {
    id: `produto-${index.toString().padStart(6, '0')}`,
    title: `Peca artesanal ${index} ${words.slice(0, 50)}`,
    category: index % 3 === 0 ? 'CERAMICA' : index % 3 === 1 ? 'TEXTIL' : 'MADEIRA',
    technique: `${vocabulary[index % vocabulary.length]} ${vocabulary[(index + 5) % vocabulary.length]}`,
    description: words,
    price: 20 + (index % 1_000),
    artisanId: `artesao-${index % 250}`,
  };
}

function median(values: number[]): number {
  const ordered = [...values].sort((first, second) => first - second);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0 ? (ordered[middle - 1] + ordered[middle]) / 2 : ordered[middle];
}

async function request(
  base: RecommendationProduct,
  candidates: RecommendationProduct[],
  mode: RecommendationMode,
): Promise<Awaited<ReturnType<typeof requestRecommendations>>> {
  return requestRecommendations(base, candidates, 8, mode);
}

async function main(): Promise<void> {
  if (!Number.isInteger(itemCount) || itemCount < 2) throw new Error('BENCHMARK_ITEMS must be at least 2.');
  if (!Number.isInteger(repetitions) || repetitions < 1) throw new Error('BENCHMARK_REPETITIONS must be at least 1.');

  const base = createProduct(itemCount + 1);
  const candidates = Array.from({ length: itemCount }, (_, index) => createProduct(index));
  const server = await startRecommendationService(0);
  const address = server.address() as AddressInfo;
  const url = `http://127.0.0.1:${address.port}`;
  const previousServiceUrl = process.env.RECOMMENDATION_SERVICE_URL;
  process.env.RECOMMENDATION_SERVICE_URL = url;

  try {
    const health = await fetch(`${url}/health`);
    if (!health.ok) throw new Error(`Recommendation service health check failed: ${health.status}.`);
    const healthResult = await health.json() as { status: string; workers: number };
    console.log(`HTTP GET /health -> ${health.status} ${healthResult.status}; worker slots=${healthResult.workers}`);

    await request(base, candidates, 'sequential');
    await request(base, candidates, 'parallel');

    const sequentialTimes: number[] = [];
    const parallelTimes: number[] = [];
    const sequentialScoringTimes: number[] = [];
    const parallelScoringTimes: number[] = [];
    let expectedIds = '';
    let workerCount = 0;
    for (let repetition = 0; repetition < repetitions; repetition += 1) {
      let sequential: Awaited<ReturnType<typeof requestRecommendations>>;
      let parallel: Awaited<ReturnType<typeof requestRecommendations>>;
      if (repetition % 2 === 0) {
        const sequentialStart = performance.now();
        sequential = await request(base, candidates, 'sequential');
        sequentialTimes.push(performance.now() - sequentialStart);
        const parallelStart = performance.now();
        parallel = await request(base, candidates, 'parallel');
        parallelTimes.push(performance.now() - parallelStart);
      } else {
        const parallelStart = performance.now();
        parallel = await request(base, candidates, 'parallel');
        parallelTimes.push(performance.now() - parallelStart);
        const sequentialStart = performance.now();
        sequential = await request(base, candidates, 'sequential');
        sequentialTimes.push(performance.now() - sequentialStart);
      }
      sequentialScoringTimes.push(sequential.durationMs);
      parallelScoringTimes.push(parallel.durationMs);
      workerCount = parallel.workerCount;

      const sequentialIds = JSON.stringify(sequential.recommendations.map(({ id }) => id));
      const parallelIds = JSON.stringify(parallel.recommendations.map(({ id }) => id));
      if (sequentialIds !== parallelIds) throw new Error('Sequential and parallel results differ.');
      expectedIds = sequentialIds;
      console.log(`HTTP POST /recommendations -> 200 mode=sequential; repeticao=${repetition + 1}/${repetitions}`);
      console.log(`HTTP POST /recommendations -> 200 mode=parallel; workers=${parallel.workerCount}`);
    }

    const sequentialMedian = median(sequentialTimes);
    const parallelMedian = median(parallelTimes);
    const sequentialScoringMedian = median(sequentialScoringTimes);
    const parallelScoringMedian = median(parallelScoringTimes);
    console.log('\nBenchmark de recomendacoes (medianas)');
    console.log(`Ambiente: ${process.platform} ${process.arch}; Node ${process.version}; CPUs logicas=${cpus().length}`);
    console.log(`Dados: ${itemCount} produtos sinteticos; aquecimento=1 chamada por modo; repeticoes=${repetitions}; limite=8`);
    console.log('| Modo | Workers | Latencia HTTP mediana (ms) | Calculo do score mediano (ms) | Ganho HTTP | Ganho no calculo |');
    console.log('|---|---:|---:|---:|---:|---:|');
    console.log(`| Sequencial | 1 | ${sequentialMedian.toFixed(2)} | ${sequentialScoringMedian.toFixed(2)} | referencia | referencia |`);
    console.log(`| Paralelo | ${workerCount} | ${parallelMedian.toFixed(2)} | ${parallelScoringMedian.toFixed(2)} | ${(sequentialMedian / parallelMedian).toFixed(2)}x | ${(sequentialScoringMedian / parallelScoringMedian).toFixed(2)}x |`);
    console.log(`Resultados equivalentes: sim (${JSON.parse(expectedIds).length} recomendacoes).`);
  } finally {
    if (previousServiceUrl === undefined) delete process.env.RECOMMENDATION_SERVICE_URL;
    else process.env.RECOMMENDATION_SERVICE_URL = previousServiceUrl;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

main().catch((error) => {
  console.error('Recommendation benchmark failed:', error);
  process.exitCode = 1;
});
