import { Product } from '../../types/produto';

export const municipalities = ['Todos os municípios', 'Recife', 'Olinda', 'Jaboatão dos Guararapes', 'Caruaru'];

function normalizeMunicipality(municipality: string): string {
  return municipality
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
}

export function filterProductsByMunicipality(products: Product[], municipality: string): Product[] {
  if (normalizeMunicipality(municipality) === normalizeMunicipality('Todos os municípios')) return products;

  const selectedMunicipality = normalizeMunicipality(municipality);
  return products.filter((product) => normalizeMunicipality(product.artisanCity) === selectedMunicipality);
}

export function sortProductsByOrder(products: Product[], sortOrder: string): Product[] {
  return [...products].sort((firstProduct, secondProduct) => {
    if (sortOrder === 'price-asc') return firstProduct.price - secondProduct.price;
    if (sortOrder === 'price-desc') return secondProduct.price - firstProduct.price;
    if (sortOrder === 'oldest') return new Date(firstProduct.createdAt).getTime() - new Date(secondProduct.createdAt).getTime();
    if (sortOrder === 'title-asc') return firstProduct.title.localeCompare(secondProduct.title, 'pt-BR');
    return new Date(secondProduct.createdAt).getTime() - new Date(firstProduct.createdAt).getTime();
  });
}
