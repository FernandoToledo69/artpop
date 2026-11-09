'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { createProduct } from '../../services/api/produtos.service';
import { getCurrentUser } from '../../services/api/auth.service';
import { ProductDraft } from '../../types/produto';
import { appendAdditionalImages, MAX_ADDITIONAL_IMAGES, selectAdditionalImageFiles, validateProductDraft } from './product-announcement';

const initialDraft: ProductDraft = {
  title: '',
  category: '',
  technique: '',
  price: '',
  stock: '1',
  description: '',
  mainImage: '',
  additionalImages: [],
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProductAnnouncementForm() {
  const [draft, setDraft] = useState<ProductDraft>(initialDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedProductId, setPublishedProductId] = useState('');

  function updateField(field: keyof ProductDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setShowSuccessModal(false);
  }

  async function handleMainImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({ ...current, mainImage: 'Escolha um arquivo de imagem.' }));
      return;
    }
    updateField('mainImage', await fileToDataUrl(file));
  }

  async function handleAdditionalImages(event: ChangeEvent<HTMLInputElement>) {
    const files = selectAdditionalImageFiles(Array.from(event.target.files ?? []), draft.additionalImages.length);
    const images = await Promise.all(files.map(fileToDataUrl));
    setDraft((current) => ({
      ...current,
      additionalImages: appendAdditionalImages(current.additionalImages, images),
    }));
  }

  function validate() {
    const nextErrors = validateProductDraft(draft);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowSuccessModal(false);
    if (!validate()) return;

    setIsSaving(true);
    const product = await createProduct(draft, getCurrentUser()?.artisanId);
    setDraft(initialDraft);
    setErrors({});
    setPublishedProductId(product.id);
    setShowSuccessModal(true);
    setIsSaving(false);
  }

  const remainingAdditionalImages = MAX_ADDITIONAL_IMAGES - draft.additionalImages.length;

  return (
    <form className="announcement-form" onSubmit={handleSubmit} noValidate>
      <section className="form-section">
        <div className="section-heading">
          <span className="section-number">01</span>
          <div><h2>Apresente sua obra</h2><p>Comece contando o que torna essa peça única.</p></div>
        </div>
        <div className="field-grid">
          <label className="field field-wide">Nome da obra
            <input value={draft.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Ex.: Vaso Brisa do Sertão" />
            {errors.title && <small className="error">{errors.title}</small>}
          </label>
          <label className="field">Categoria
            <select value={draft.category} onChange={(event) => updateField('category', event.target.value as ProductDraft['category'])}>
              <option value="">Selecione</option><option value="ceramica">Cerâmica</option><option value="madeira">Madeira</option><option value="textil">Têxtil</option><option value="joalheria">Joalheria</option><option value="outros">Outros</option>
            </select>
            {errors.category && <small className="error">{errors.category}</small>}
          </label>
          <label className="field">Técnica
            <input value={draft.technique} onChange={(event) => updateField('technique', event.target.value)} placeholder="Ex.: Modelagem manual" />
            {errors.technique && <small className="error">{errors.technique}</small>}
          </label>
          <label className="field field-wide">Descrição da obra
            <textarea value={draft.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Fale sobre a inspiração, os materiais e a história por trás da peça." rows={5} />
            <span className="character-count">{draft.description.length}/600</span>
            {errors.description && <small className="error">{errors.description}</small>}
          </label>
        </div>
      </section>

      <section className="form-section media-section">
        <div className="section-heading"><span className="section-number">02</span><div><h2>Mostre os detalhes</h2><p>Uma boa foto aproxima a pessoa da sua criação.</p></div></div>
        <div className="upload-layout">
          <label className={`main-upload ${errors.mainImage ? 'has-error' : ''}`}>
            {draft.mainImage ? <img src={draft.mainImage} alt="Prévia da foto principal" /> : <><span className="upload-icon">+</span><strong>Adicionar foto principal</strong><span>JPG ou PNG · até 5 MB</span></>}
            <input type="file" accept="image/png,image/jpeg" onChange={handleMainImage} />
          </label>
          <div className="additional-upload"><p>Outras fotos <span>(opcional)</span></p><label className="secondary-upload"><span>+</span> {remainingAdditionalImages === 0 ? 'Limite de 4 fotos atingido' : remainingAdditionalImages === 1 ? 'Adicionar mais 1 foto' : `Adicionar até ${remainingAdditionalImages} fotos`}<input type="file" accept="image/png,image/jpeg" multiple disabled={remainingAdditionalImages === 0} onChange={handleAdditionalImages} /></label><div className="thumbnail-row">{draft.additionalImages.map((image) => <img key={image} src={image} alt="Prévia adicional da obra" />)}</div></div>
        </div>
        {errors.mainImage && <small className="error">{errors.mainImage}</small>}
      </section>

      <section className="form-section">
        <div className="section-heading"><span className="section-number">03</span><div><h2>Defina sua oferta</h2><p>Esses dados ajudam a pessoa a decidir pela compra.</p></div></div>
        <div className="field-grid offer-grid">
          <label className="field">Preço da obra <div className="input-prefix"><span>R$</span><input type="number" min="0.01" step="0.01" value={draft.price} onChange={(event) => updateField('price', event.target.value)} placeholder="0,00" /></div>{errors.price && <small className="error">{errors.price}</small>}</label>
          <label className="field">Quantidade disponível <input type="number" min="1" step="1" value={draft.stock} onChange={(event) => updateField('stock', event.target.value)} />{errors.stock && <small className="error">{errors.stock}</small>}</label>
        </div>
      </section>

      <div className="form-footer"><p>Você poderá editar essas informações depois.</p><button type="submit" disabled={isSaving}>{isSaving ? 'Publicando...' : 'Publicar obra'}</button></div>
      {showSuccessModal && <div className="announcement-success-backdrop" role="presentation"><section className="announcement-success-modal" role="dialog" aria-modal="true" aria-labelledby="announcement-success-title"><h2 id="announcement-success-title">Publicação concluída</h2><p>Sua obra foi publicada com sucesso! Você já pode visualizá-la nos anúncios.</p><a className="announcement-success-link" href={`/produtos/${publishedProductId}`}>Visualize seu anúncio</a></section></div>}
    </form>
  );
}