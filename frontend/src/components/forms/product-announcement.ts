import { ProductDraft } from '../../types/produto';

export const MAX_ADDITIONAL_IMAGES = 4;

export function selectAdditionalImageFiles(files: readonly File[], currentCount = 0): File[] {
  return files
    .filter((file) => file.type.startsWith('image/'))
    .slice(0, Math.max(0, MAX_ADDITIONAL_IMAGES - currentCount));
}

export function appendAdditionalImages(currentImages: readonly string[], newImages: readonly string[]): string[] {
  return [...currentImages, ...newImages].slice(0, MAX_ADDITIONAL_IMAGES);
}

export function validateProductDraft(draft: ProductDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.title.trim()) errors.title = 'Dê um nome para sua obra.';
  if (!draft.category) errors.category = 'Escolha uma categoria.';
  if (!draft.technique.trim()) errors.technique = 'Informe a técnica utilizada.';
  if (!draft.price || Number(draft.price) <= 0) errors.price = 'Informe um preço maior que zero.';
  if (!draft.stock || Number(draft.stock) < 1) errors.stock = 'Informe ao menos uma unidade.';
  if (draft.description.trim().length < 20) errors.description = 'Conte um pouco mais sobre a obra (mínimo de 20 caracteres).';
  if (!draft.mainImage) errors.mainImage = 'A foto principal é obrigatória.';
  return errors;
}
