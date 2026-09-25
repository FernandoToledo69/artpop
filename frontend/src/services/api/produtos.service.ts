import { Product, ProductDraft } from '../../types/produto';
import { demoProducts } from '../../mocks/products';
import { readArtisanProfile } from './usuarios.service';

const STORAGE_KEY = 'origem:products';

const catalogImages: Record<string, string> = {
  'stefani-1': 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=900&q=85',
  'demo-1': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4vastJAhGTtd-oop9R68NQCR5NZg3Q2En_wOtpmrTTg&s',
  'demo-2': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYHtew26nGqIHbOPfxir6vSz3ulCU_2IxwBEsGuxILsA&s',
  'demo-3': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTReBMm8JrHMHLJWMFwwKa9ffxQJICQH5MvgSoce2ScAQ&s',
  'demo-4': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS82Me8J_zrUee80e5cZBJsHBNa5dz0tY78vaSVqWwES_ik3zn7gw6t4U&s=10',
  'demo-5': 'https://assets.sistemawbuy.com.br/arquivos/25da0811fb048bfc1888f770199b3664/produtos/69795c698a973/img_2590-69795dd2b06fd.jpg',
  'demo-6': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXmeVML2NbQcCgXkbL5eW5vhLdmIWZHeKFo2ffZVfcFmlYGeTGh5Z6yP-C&s=10',
  'demo-7': 'https://cdn.awsli.com.br/800x800/624/624507/produto/347128140/xilogravura_22-w5ta0rvrxy.jpg',
  'demo-8': 'https://letseatit.com.br/cdn/shop/files/WhatsAppImage2026-02-10at15.13.49.jpg?v=1770747692',
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

