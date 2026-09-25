import { Product, ProductDraft } from '../../types/produto';
import { demoProducts } from '../../mocks/products';
import { readArtisanProfile } from './usuarios.service';

const STORAGE_KEY = 'origem:products';

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
  return [...demoProducts.filter((product) => !savedIds.has(product.id)), ...saved];
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

