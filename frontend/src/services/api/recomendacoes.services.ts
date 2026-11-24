import { Product } from '../../types/produto';
import { demoProducts } from '../../mocks/products';
import { readCatalogProducts } from './produtos.service';
import { apiFetch, isApiConfigured } from './client';

export function readRelatedProducts(product: Product, limit = 4): Product[] {
  return readCatalogProducts()
    .filter((item) => item.id !== product.id)
    .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category) || Number(b.technique === product.technique) - Number(a.technique === product.technique))
    .slice(0, limit);
}

export async function fetchRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (!isApiConfigured()) return readRelatedProducts(product, limit);
  const relatedProducts = await apiFetch<Product[]>(
    `/api/recomendacoes?productId=${encodeURIComponent(product.id)}`,
  );
  return relatedProducts.slice(0, limit);
}
