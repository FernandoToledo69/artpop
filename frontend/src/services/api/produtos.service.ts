import { Product, ProductDraft } from '../../types/produto';
import { demoProducts } from '../../mocks/products';
import { readArtisanProfile } from './usuarios.service';

const STORAGE_KEY = 'origem:products';

const catalogImages: Record<string, string> = {
  'stefani-1': 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=900&q=85',
  'demo-1': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85',
  'demo-2': 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=900&q=85',
  'demo-3': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85',
  'demo-4': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85',
  'demo-5': 'https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=900&q=85',
  'demo-6': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85',
  'demo-7': 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=900&q=85',
  'demo-8': 'https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=900&q=85',
};

export async function createProduct(draft: ProductDraft): Promise<Product> {
  const product: Product = {
    ...draft,
    id: crypto.randomUUID(),
    price: Number(draft.price),
    stock: Number(draft.stock),
    createdAt: new Date().toISOString(),
    artisanCity: readArtisanProfile().city,
  };

  const savedProducts = readProducts();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([product, ...savedProducts]));
  return product;
}

export function readProducts(): Product[] {
  if (typeof window === 'undefined') return [];

  try {
    return (JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Product[]).map((product) => ({
      ...product,
      artisanCity: product.artisanCity || readArtisanProfile().city,
    }));
  } catch {
    return [];
  }
}

export function readCatalogProducts(): Product[] {
  const saved = readProducts();
  const savedIds = new Set(saved.map((product) => product.id));
  return [...demoProducts.filter((product) => !savedIds.has(product.id)), ...saved].map((product) => ({
    ...product,
    mainImage: product.mainImage || catalogImages[product.id] || '',
  }));
}

export function updateProductStock(productId: string, stock: number, fallbackProduct?: Product): Product | null {
  const products = readProducts();
  const productIndex = products.findIndex((product) => product.id === productId);
  if (productIndex === -1) {
    const sourceProduct = fallbackProduct ?? demoProducts.find((product) => product.id === productId);
    if (!sourceProduct) return null;
    const savedProduct = { ...sourceProduct, stock };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([savedProduct, ...products]));
    return savedProduct;
  }

  const updatedProduct = { ...products[productIndex], stock };
  const updatedProducts = [...products];
  updatedProducts[productIndex] = updatedProduct;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
  return updatedProduct;
}

export function updateProduct(productId: string, updates: ProductDraft, fallbackProduct?: Product): Product | null {
  const products = readProducts();
  const productIndex = products.findIndex((product) => product.id === productId);
  const currentProduct = productIndex >= 0 ? products[productIndex] : fallbackProduct;
  if (!currentProduct) return null;

  const updatedProduct: Product = {
    ...currentProduct,
    ...updates,
    price: Number(updates.price),
    stock: Number(updates.stock),
  };
  const updatedProducts = productIndex >= 0
    ? products.map((product, index) => index === productIndex ? updatedProduct : product)
    : [updatedProduct, ...products];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
  return updatedProduct;
}

