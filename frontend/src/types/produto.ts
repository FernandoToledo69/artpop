export type ProductCategory = 'ceramica' | 'madeira' | 'textil' | 'joalheria' | 'outros';

export interface ProductDraft {
  title: string;
  category: ProductCategory | '';
  technique: string;
  price: string;
  stock: string;
  description: string;
  mainImage: string;
  additionalImages: string[];
}

export interface Product extends Omit<ProductDraft, 'price' | 'stock'> {
  id: string;
  price: number;
  stock: number;
  createdAt: string;
}