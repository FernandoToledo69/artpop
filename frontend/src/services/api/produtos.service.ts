import { Product, ProductCategory, ProductDraft } from '../../types/produto';
import type { AuthUser } from '../../types/auth';
import { demoProducts } from '../../mocks/products';
import { readArtisanProfile } from './usuarios.service';

const STORAGE_KEY = 'origem:products';

function saveProducts(products: Product[]): void {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

const estimatedShippingMeasurements: Record<ProductCategory, Pick<Product, 'weightKg' | 'lengthCm' | 'widthCm' | 'heightCm'>> = {
  ceramica: { weightKg: 1.2, lengthCm: 20, widthCm: 20, heightCm: 30 },
  madeira: { weightKg: 0.8, lengthCm: 30, widthCm: 20, heightCm: 8 },
  textil: { weightKg: 0.8, lengthCm: 35, widthCm: 20, heightCm: 15 },
  joalheria: { weightKg: 0.15, lengthCm: 18, widthCm: 12, heightCm: 5 },
  outros: { weightKg: 0.3, lengthCm: 25, widthCm: 20, heightCm: 5 },
};

const shippingMeasurementFields = ['weightKg', 'lengthCm', 'widthCm', 'heightCm'] as const;

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

export async function createProduct(draft: ProductDraft, artisanId?: string): Promise<Product> {
  const artisanProfile = readArtisanProfile();
  const product: Product = {
    ...draft,
    id: crypto.randomUUID(),
    price: Number(draft.price),
    stock: Number(draft.stock),
    weightKg: Number(draft.weightKg),
    lengthCm: Number(draft.lengthCm),
    widthCm: Number(draft.widthCm),
    heightCm: Number(draft.heightCm),
    createdAt: new Date().toISOString(),
    artisanCity: artisanProfile.city.trim(),
    artisanId,
    artisanName: artisanProfile.name,
    artisanBio: artisanProfile.bio,
  };

  const savedProducts = readProducts();
  saveProducts([product, ...savedProducts]);
  return product;
}

export function readProducts(): Product[] {
  if (typeof window === 'undefined') return [];

  try {
    const savedProducts = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Product[];
    let hasLegacyMeasurements = false;
    const products = savedProducts.map((product) => {
      const defaults = product.category && estimatedShippingMeasurements[product.category]
        ? estimatedShippingMeasurements[product.category]
        : estimatedShippingMeasurements.outros;
      const hasMissingMeasurements = shippingMeasurementFields.some((field) => (
        !Number.isFinite(Number(product[field])) || Number(product[field]) <= 0
      ));
      if (hasMissingMeasurements) hasLegacyMeasurements = true;
      const getMeasurement = (field: typeof shippingMeasurementFields[number]) => {
        const value = Number(product[field]);
        return Number.isFinite(value) && value > 0 ? value : defaults[field];
      };
      const measurements = {
        weightKg: getMeasurement('weightKg'),
        lengthCm: getMeasurement('lengthCm'),
        widthCm: getMeasurement('widthCm'),
        heightCm: getMeasurement('heightCm'),
      };

      return {
        ...product,
        artisanCity: product.artisanCity || '',
        artisanName: product.artisanName || 'Artesão',
        ...measurements,
        ...(product.shippingMeasurementsEstimated || hasMissingMeasurements
          ? { shippingMeasurementsEstimated: true }
          : {}),
      };
    });

    if (hasLegacyMeasurements) saveProducts(products);
    return products;
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

export function isProductOwner(product: Product, user: AuthUser | null): boolean {
  if (user?.role !== 'artisan') return false;
  return Boolean(product.artisanId && product.artisanId === user.artisanId);
}

export function deleteProduct(productId: string): void {
  const remainingProducts = readProducts().filter((product) => product.id !== productId);
  saveProducts(remainingProducts);
}

export function updateProductStock(productId: string, stock: number, fallbackProduct?: Product): Product | null {
  const products = readProducts();
  const productIndex = products.findIndex((product) => product.id === productId);
  if (productIndex === -1) {
    const sourceProduct = fallbackProduct ?? demoProducts.find((product) => product.id === productId);
    if (!sourceProduct) return null;
    const savedProduct = { ...sourceProduct, stock };
    saveProducts([savedProduct, ...products]);
    return savedProduct;
  }

  const updatedProduct = { ...products[productIndex], stock };
  const updatedProducts = [...products];
  updatedProducts[productIndex] = updatedProduct;
  saveProducts(updatedProducts);
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
    weightKg: Number(updates.weightKg),
    lengthCm: Number(updates.lengthCm),
    widthCm: Number(updates.widthCm),
    heightCm: Number(updates.heightCm),
    shippingMeasurementsEstimated: currentProduct.shippingMeasurementsEstimated
      ? shippingMeasurementFields.every((field) => Number(updates[field]) === currentProduct[field])
      : undefined,
  };
  const updatedProducts = productIndex >= 0
    ? products.map((product, index) => index === productIndex ? updatedProduct : product)
    : [updatedProduct, ...products];
  saveProducts(updatedProducts);
  return updatedProduct;
}
