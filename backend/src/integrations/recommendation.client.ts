import { RecommendationProduct, RecommendationMode } from '../recommendation-service/recommendation.types';

export interface RecommendationResult {
  recommendations: Array<{ id: string; score: number }>;
  durationMs: number;
  workerCount: number;
  mode: RecommendationMode;
}

export async function requestRecommendations(
  base: RecommendationProduct,
  candidates: RecommendationProduct[],
  limit = 8,
  mode: RecommendationMode = 'parallel',
): Promise<RecommendationResult> {
  const recommendationServiceUrl = process.env.RECOMMENDATION_SERVICE_URL ?? 'http://127.0.0.1:3334';
  const response = await fetch(`${recommendationServiceUrl}/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base, candidates, limit, mode }),
  });

  if (!response.ok) {
    throw new Error(`Recommendation service returned status ${response.status}.`);
  }

  return response.json() as Promise<RecommendationResult>;
}
