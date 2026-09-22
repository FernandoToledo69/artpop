'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { demoProducts } from '../marketplace/MarketplaceProducts';
import { readProducts, updateProduct } from '../../services/produtos.service';
import { Product, ProductDraft } from '../../types/produto';

function fileToDataUrl(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

export default function ProductEditForm({ productId }: { productId: string }) {
	const [product, setProduct] = useState<Product | null>(null);
	const [draft, setDraft] = useState<ProductDraft | null>(null);
	const [error, setError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	useEffect(() => {
		const foundProduct = [...demoProducts, ...readProducts()].find((item) => item.id === productId) ?? null;
		setProduct(foundProduct);
		if (foundProduct) setDraft({ ...foundProduct, price: String(foundProduct.price), stock: String(foundProduct.stock) });
	}, [productId]);

	function updateField(field: keyof ProductDraft, value: string) {
		setDraft((current) => current ? { ...current, [field]: value } : current);
		setError('');
		setSuccessMessage('');
	}

	async function handleAdditionalImages(event: ChangeEvent<HTMLInputElement>) {
		if (!draft) return;
		const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/')).slice(0, 4);
		const images = await Promise.all(files.map(fileToDataUrl));
		setDraft({ ...draft, additionalImages: images });
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!draft || !product) return;
		if (draft.additionalImages.length > 4) {
			setError('Adicione no máximo 4 fotos extras.');
			return;
		}
		updateProduct(product.id, draft, product);
		setSuccessMessage('Obra atualizada com sucesso.');
	}

	if (!draft) return <div className="catalog-empty"><h2>Obra não encontrada</h2><p>Este anúncio não está disponível para edição.</p><a className="catalog-action" href="/painel-artesao">Voltar ao painel</a></div>;

	return <form className="announcement-form" onSubmit={handleSubmit}>
		<section className="form-section"><div className="section-heading"><span className="section-number">01</span><div><h2>Dados da obra</h2><p>Atualize as informações que aparecem no anúncio.</p></div></div><div className="field-grid"><label className="field field-wide">Nome da obra<input value={draft.title} onChange={(event) => updateField('title', event.target.value)} /></label><label className="field">Categoria<select value={draft.category} onChange={(event) => updateField('category', event.target.value)}><option value="ceramica">Cerâmica</option><option value="madeira">Madeira</option><option value="textil">Têxtil</option><option value="joalheria">Joalheria</option><option value="outros">Outros</option></select></label><label className="field">Técnica<input value={draft.technique} onChange={(event) => updateField('technique', event.target.value)} /></label><label className="field field-wide">Descrição<textarea value={draft.description} onChange={(event) => updateField('description', event.target.value)} rows={5} /></label></div></section>
		<section className="form-section media-section"><div className="section-heading"><span className="section-number">02</span><div><h2>Fotos da obra</h2><p>A foto principal e até 4 fotos extras aparecem na galeria.</p></div></div><div className="upload-layout"><label className="main-upload"><img src={draft.mainImage} alt="Foto principal da obra" /><input type="file" accept="image/png,image/jpeg" onChange={async (event) => { const file = event.target.files?.[0]; if (file) updateField('mainImage', await fileToDataUrl(file)); }} /></label><div className="additional-upload"><p>Fotos extras <span>({draft.additionalImages.length}/4)</span></p><label className="secondary-upload"><span>+</span> Substituir fotos extras<input type="file" accept="image/png,image/jpeg" multiple onChange={handleAdditionalImages} /></label><div className="thumbnail-row">{draft.additionalImages.map((image) => <img key={image} src={image} alt="Prévia de foto extra" />)}</div></div></div>{error && <small className="error">{error}</small>}</section>
		<section className="form-section"><div className="section-heading"><span className="section-number">03</span><div><h2>Oferta</h2><p>Preço e disponibilidade da peça.</p></div></div><div className="field-grid offer-grid"><label className="field">Preço<div className="input-prefix"><span>R$</span><input type="number" min="0.01" step="0.01" value={draft.price} onChange={(event) => updateField('price', event.target.value)} /></div></label><label className="field">Estoque<input type="number" min="1" value={draft.stock} onChange={(event) => updateField('stock', event.target.value)} /></label></div></section>
		<div className="form-footer"><a href="/painel-artesao">Cancelar</a><button type="submit">Salvar alterações</button></div>{successMessage && <p className="success-message" role="status">{successMessage} <a href={`/produtos/${productId}`}>Ver anúncio</a></p>}
	</form>;
}