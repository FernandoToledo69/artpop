import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import { Worker } from 'node:worker_threads';
import { RecommendationMode, RecommendationProduct, ScoredRecommendation } from './recommendation.types';

interface WorkerSlot {
  worker: Worker;
  failed: boolean;
}

interface PendingTask {
  worker: Worker;
  resolve: (scores: ScoredRecommendation[]) => void;
  reject: (error: Error) => void;
}

const workerSlots: WorkerSlot[] = [];
const pendingTasks = new Map<number, PendingTask>();
let nextTaskId = 0;

function tokens(product: RecommendationProduct): Set<string> {
  return new Set(`${product.title} ${product.technique} ${product.description}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu) ?? []);
}

function scoreProduct(base: RecommendationProduct, product: RecommendationProduct): ScoredRecommendation {
  const baseTokens = tokens(base);
  const productTokens = tokens(product);
  let sharedTokens = 0;
  for (const token of baseTokens) {
    if (productTokens.has(token)) sharedTokens += 1;
  }
  const unionSize = baseTokens.size + productTokens.size - sharedTokens;
  const textSimilarity = unionSize === 0 ? 0 : sharedTokens / unionSize;
  const priceDistance = Math.abs(base.price - product.price) / Math.max(base.price, product.price, 1);
  const score =
    (base.category === product.category ? 40 : 0) +
    textSimilarity * 30 +
    (1 - priceDistance) * 20 +
    (base.artisanId !== product.artisanId ? 10 : 0);

  return { id: product.id, score };
}

export function scoreChunk(
  base: RecommendationProduct,
  products: RecommendationProduct[],
): ScoredRecommendation[] {
  return products.map((product) => scoreProduct(base, product));
}

async function scoreInWorker(
  base: RecommendationProduct,
  products: RecommendationProduct[],
  slotIndex: number,
): Promise<ScoredRecommendation[]> {
  let slot = workerSlots[slotIndex];
  if (!slot || slot.failed) {
    const worker = new Worker(join(__dirname, 'scoring.worker.js'));
    slot = { worker, failed: false };
    workerSlots[slotIndex] = slot;
    worker.on('message', ({ id, recommendations }: {
      id: number;
      recommendations: ScoredRecommendation[];
    }) => {
      const task = pendingTasks.get(id);
      if (!task || task.worker !== worker) return;
      pendingTasks.delete(id);
      task.resolve(recommendations);
    });
    const rejectWorkerTasks = (error: Error) => {
      slot!.failed = true;
      for (const [id, task] of pendingTasks) {
        if (task.worker === worker) {
          pendingTasks.delete(id);
          task.reject(error);
        }
      }
    };
    worker.on('error', rejectWorkerTasks);
    worker.on('exit', (code) => {
      if (code !== 0) rejectWorkerTasks(new Error(`Recommendation worker exited with code ${code}.`));
    });
  }
  const worker = slot.worker;
  const id = nextTaskId++;

  return new Promise((resolve, reject) => {
    pendingTasks.set(id, { worker, resolve, reject });
    try {
      worker.postMessage({ id, base, products });
    } catch (error) {
      pendingTasks.delete(id);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export function getWorkerCount(productCount: number): number {
  return Math.min(4, productCount, availableParallelism());
}

export async function scoreRecommendations(
  base: RecommendationProduct,
  products: RecommendationProduct[],
  mode: RecommendationMode,
): Promise<ScoredRecommendation[]> {
  if (mode === 'sequential' || products.length < 2) return scoreChunk(base, products);

  const workerCount = getWorkerCount(products.length);
  if (workerCount < 2) return scoreChunk(base, products);

  const chunkSize = Math.ceil(products.length / workerCount);
  const chunks = Array.from({ length: workerCount }, (_, index) =>
    products.slice(index * chunkSize, (index + 1) * chunkSize),
  ).filter((chunk) => chunk.length > 0);
  const scoredChunks = await Promise.all(chunks.map((chunk, index) => scoreInWorker(base, chunk, index)));
  return scoredChunks.flat();
}

export async function closeRecommendationWorkers(): Promise<void> {
  const activeWorkers = workerSlots.splice(0, workerSlots.length);
  for (const [id, task] of pendingTasks) {
    pendingTasks.delete(id);
    task.reject(new Error('Recommendation workers are shutting down.'));
  }
  await Promise.all(activeWorkers.map(({ worker }) => worker.terminate()));
}

export function rankRecommendations(
  recommendations: ScoredRecommendation[],
  limit: number,
): ScoredRecommendation[] {
  return recommendations
    .sort((first, second) => second.score - first.score || first.id.localeCompare(second.id))
    .slice(0, limit);
}
