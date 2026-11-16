export type ProductCategory = 'ceramica' | 'madeira' | 'textil' | 'joalheria' | 'outros';

export interface ProductDraft {
  title: string;
  category: ProductCategory | '';
  technique: string;
  price: string;
  stock: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  description: string;
  mainImage: string;
  additionalImages: string[];
}

export interface Product extends Omit<ProductDraft, 'price' | 'stock' | 'weightKg' | 'lengthCm' | 'widthCm' | 'heightCm'> {
  id: string;
  price: number;
  stock: number;
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  shippingMeasurementsEstimated?: boolean;
  createdAt: string;
  artisanCity: string;
  artisanId?: string;
  artisanName?: string;
  artisanBio?: string;
}