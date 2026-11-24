import { parentPort } from 'node:worker_threads';
import { RecommendationProduct } from './recommendation.types';
import { scoreChunk } from './scoring';

const workerPort = parentPort;
if (workerPort) {
  workerPort.on('message', ({ id, base, products }: {
    id: number;
    base: RecommendationProduct;
    products: RecommendationProduct[];
  }) => {
    workerPort.postMessage({ id, recommendations: scoreChunk(base, products) });
  });
}
