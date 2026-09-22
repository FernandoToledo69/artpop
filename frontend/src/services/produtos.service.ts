import { Product, ProductDraft } from '../types/produto';

const STORAGE_KEY = 'origem:products';

export async function createProduct(draft: ProductDraft): Promise<Product> {
  const product: Product = {
    ...draft,
    id: crypto.randomUUID(),
    price: Number(draft.price),
    stock: Number(draft.stock),
    createdAt: new Date().toISOString(),
  };

  const savedProducts = readProducts();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([product, ...savedProducts]));
  return product;
}

export function readProducts(): Product[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Product[];
  } catch {
    return [];
  }
}