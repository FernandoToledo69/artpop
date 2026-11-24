export interface RecommendationProduct {
  id: string;
  title: string;
  category: string;
  technique: string;
  description: string;
  price: number;
  artisanId: string;
}

export interface ScoredRecommendation {
  id: string;
  score: number;
}

export type RecommendationMode = 'sequential' | 'parallel';
