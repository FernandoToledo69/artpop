import { ProductDraft } from '../../types/produto';

export const MAX_ADDITIONAL_IMAGES = 4;

export function selectAdditionalImageFiles(files: readonly File[], currentCount = 0): File[] {
  return files
    .filter((file) => file.type.startsWith('image/'))
    .slice(0, Math.max(0, MAX_ADDITIONAL_IMAGES - currentCount));
}

export function selectProductImageFiles(
  files: readonly File[],
  currentAdditionalCount = 0,
  hasMainImage = false,
): File[] {
  const availableSlots = MAX_ADDITIONAL_IMAGES - currentAdditionalCount + (hasMainImage ? 0 : 1);
  return files
    .filter((file) => file.type.startsWith('image/'))
    .slice(0, Math.max(0, availableSlots));
}

export function appendAdditionalImages(currentImages: readonly string[], newImages: readonly string[]): string[] {
  return [...currentImages, ...newImages].slice(0, MAX_ADDITIONAL_IMAGES);
}

export function appendProductImages(
  mainImage: string,
  additionalImages: readonly string[],
  newImages: readonly string[],
): { mainImage: string; additionalImages: string[] } {
  let nextMainImage = mainImage;
  let nextAdditionalImages = [...newImages];
  if (!nextMainImage && nextAdditionalImages.length > 0) {
    [nextMainImage, ...nextAdditionalImages] = nextAdditionalImages;
  }
  return {
    mainImage: nextMainImage,
    additionalImages: appendAdditionalImages(additionalImages, nextAdditionalImages),
  };
}

export function moveAdditionalImage(images: readonly string[], index: number, direction: -1 | 1): string[] {
  const targetIndex = index + direction;
  if (index < 0 || index >= images.length || targetIndex < 0 || targetIndex >= images.length) return [...images];

  const reorderedImages = [...images];
  [reorderedImages[index], reorderedImages[targetIndex]] = [reorderedImages[targetIndex], reorderedImages[index]];
  return reorderedImages;
}

export function promoteAdditionalImage(
  mainImage: string,
  additionalImages: readonly string[],
  index: number,
): { mainImage: string; additionalImages: string[] } {
  if (index < 0 || index >= additionalImages.length) {
    return { mainImage, additionalImages: [...additionalImages] };
  }

  const reorderedImages = [...additionalImages];
  const promotedImage = reorderedImages[index];
  reorderedImages.splice(index, 1);
  if (mainImage) reorderedImages.unshift(mainImage);
  return { mainImage: promotedImage, additionalImages: reorderedImages };
}

export function validateProductDraft(draft: ProductDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.title.trim()) errors.title = 'Dê um nome para sua obra.';
  if (!draft.category) errors.category = 'Escolha uma categoria.';
  if (!draft.technique.trim()) errors.technique = 'Informe a técnica utilizada.';
  if (!draft.price || Number(draft.price) <= 0) errors.price = 'Informe um preço maior que zero.';
  if (!draft.stock || Number(draft.stock) < 1) errors.stock = 'Informe ao menos uma unidade.';
  if (!draft.weightKg || !Number.isFinite(Number(draft.weightKg)) || Number(draft.weightKg) <= 0) errors.weightKg = 'Informe um peso maior que zero.';
  if (!draft.lengthCm || !Number.isFinite(Number(draft.lengthCm)) || Number(draft.lengthCm) <= 0) errors.lengthCm = 'Informe um comprimento maior que zero.';
  if (!draft.widthCm || !Number.isFinite(Number(draft.widthCm)) || Number(draft.widthCm) <= 0) errors.widthCm = 'Informe uma largura maior que zero.';
  if (!draft.heightCm || !Number.isFinite(Number(draft.heightCm)) || Number(draft.heightCm) <= 0) errors.heightCm = 'Informe uma altura maior que zero.';
  if (draft.description.trim().length < 20) errors.description = 'Conte um pouco mais sobre a obra (mínimo de 20 caracteres).';
  if (!draft.mainImage) errors.mainImage = 'A foto principal é obrigatória.';
  return errors;
}
