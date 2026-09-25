import { demoProducts } from '../../mocks/products';
import { Product } from '../../types/produto';
import { ArtisanProfile } from '../../types/usuario';
import { readArtisanProfile } from './usuarios.service';
import { readCatalogProducts } from './produtos.service';

export interface ArtisanSummary extends ArtisanProfile { id: string; products: Product[]; }

function slugify(value: string): string { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export function readArtisans(): ArtisanSummary[] {
  const products = readCatalogProducts();
  const names = Array.from(new Set(products.map((product) => product.artisanName ?? `Ateliê ${product.artisanCity}`)));
  return names.map((name) => {
    const artisanProducts = products.filter((product) => (product.artisanName ?? `Ateliê ${product.artisanCity}`) === name);
    const profile = name === readArtisanProfile().name ? readArtisanProfile() : { ...readArtisanProfile(), name, city: artisanProducts[0]?.artisanCity ?? '' };
    return { ...profile, id: slugify(name), products: artisanProducts };
  });
}

export function readArtisanById(id: string): ArtisanSummary | null { return readArtisans().find((artisan) => artisan.id === id) ?? null; }