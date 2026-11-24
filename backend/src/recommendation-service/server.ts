import 'dotenv/config';
import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { performance } from 'node:perf_hooks';
import { z } from 'zod';
import { closeRecommendationWorkers, getWorkerCount, rankRecommendations, scoreRecommendations } from './scoring';

const productSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  category: z.string(),
  technique: z.string(),
  description: z.string(),
  price: z.number().nonnegative(),
  artisanId: z.string(),
});

const requestSchema = z.object({
  base: productSchema,
  candidates: z.array(productSchema).max(100_000),
  limit: z.number().int().min(1).max(100).default(8),
  mode: z.enum(['sequential', 'parallel']).default('parallel'),
});

class RequestBodyTooLargeError extends Error {}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  let body = '';
  for await (const chunk of request) {
    body += chunk.toString();
    if (body.length > 20_000_000) throw new RequestBodyTooLargeError('Request body exceeds 20 MB.');
  }
  return JSON.parse(body);
}

export function createRecommendationServer(): Server {
  return createServer(async (request, response) => {
    if (request.method === 'GET' && request.url === '/health') {
      sendJson(response, 200, { status: 'ok', workers: getWorkerCount(4) });
      return;
    }

    if (request.method !== 'POST' || request.url !== '/recommendations') {
      sendJson(response, 404, { error: 'Route not found.' });
      return;
    }

    try {
      const input = requestSchema.parse(await readJson(request));
      const startedAt = performance.now();
      const scores = await scoreRecommendations(input.base, input.candidates, input.mode);
      const durationMs = performance.now() - startedAt;
      const ranked = rankRecommendations(scores, input.limit);
      sendJson(response, 200, {
        recommendations: ranked,
        durationMs: Number(durationMs.toFixed(3)),
        workerCount: input.mode === 'parallel' ? getWorkerCount(input.candidates.length) : 1,
        mode: input.mode,
      });
    } catch (error) {
      if (error instanceof RequestBodyTooLargeError) {
        sendJson(response, 413, { error: 'Request body exceeds 20 MB.' });
        return;
      }
      if (error instanceof z.ZodError || error instanceof SyntaxError) {
        sendJson(response, 400, { error: 'Invalid recommendation request.' });
        return;
      }
      console.error('Recommendation request failed:', error);
      sendJson(response, 500, { error: 'Recommendation processing failed.' });
    }
  });
}

export function startRecommendationService(port = Number(process.env.RECOMMENDATION_PORT ?? 3334)): Promise<Server> {
  const server = createRecommendationServer();
  const host = process.env.RECOMMENDATION_HOST ?? '0.0.0.0';
  server.once('close', () => {
    void closeRecommendationWorkers();
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.removeListener('error', reject);
      resolve(server);
    });
  });
}

if (require.main === module) {
  startRecommendationService().then((server) => {
    const address = server.address();
    console.log(`Recommendation service listening on ${typeof address === 'object' && address ? address.port : ''}`);
  }).catch((error) => {
    console.error('Failed to start recommendation service:', error);
    process.exitCode = 1;
  });
}
