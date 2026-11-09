import { Product } from '../../types/produto';
import { PublicArtisanProfile } from '../../types/usuario';
import { readArtisanProfileForUser } from './usuarios.service';
import { readCatalogProducts } from './produtos.service';

export interface ArtisanSummary extends PublicArtisanProfile {
  id: string;
  products: Product[];
}

function slugify(value: string): string { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export function readArtisans(): ArtisanSummary[] {
  const products = readCatalogProducts();
  const groups = new Map<string, Product[]>();
  products.forEach((product) => {
    const key = product.artisanId ? `user:${product.artisanId}` : `name:${product.artisanName ?? product.artisanCity}`;
    groups.set(key, [...(groups.get(key) ?? []), product]);
  });
  return Array.from(groups.entries()).map(([key, artisanProducts]) => {
    const firstProduct = artisanProducts[0];
    const name = firstProduct.artisanName ?? `Ateliê ${firstProduct.artisanCity}`;
    const profile = key.startsWith('user:')
      ? readArtisanProfileForUser(key.slice('user:'.length))
      : { name: '', phone: '', city: '', state: '', bio: '', avatarImage: '' } satisfies PublicArtisanProfile;
    return {
      name: profile.name || name,
      phone: profile.phone,
      city: profile.city || firstProduct.artisanCity || '',
      state: profile.state,
      bio: profile.bio,
      avatarImage: profile.avatarImage,
      id: slugify(profile.name || name),
      products: artisanProducts,
    };
  });
}

export function readArtisanById(id: string): ArtisanSummary | null { return readArtisans().find((artisan) => artisan.id === id) ?? null; }