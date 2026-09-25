'use client';

import { FormEvent, useEffect, useState } from 'react';
import { readCatalogProducts } from '../../services/api/produtos.service';
import { readArtisanProfile } from '../../services/api/usuarios.service';
import { Product } from '../../types/produto';
import { demoProducts } from '../../mocks/products';
import { addToCart } from '../../services/api/carrinho.service';
import { readRelatedProducts } from '../../services/api/recomendacoes.services';
import ProfileAvatar from '../ui/ProfileAvatar';

const stories: Record<string, string> = {
  Recife: 'Artista recifense, transforma memórias da cidade em objetos que carregam textura, cor e afeto. Seu trabalho nasce de encontros entre a matéria e as paisagens do cotidiano.',
  Olinda: 'Criadora olindense, pesquisa as cores das fachadas e as narrativas populares do seu bairro. Cada peça é feita lentamente, respeitando o tempo do ofício.',
  Caruaru: 'Artesã do agreste, aprendeu o ofício com a família e hoje reinventa técnicas tradicionais em criações contemporâneas, sem perder o vínculo com suas raízes.',
  'Jaboatão dos Guararapes': 'Marceneiro e designer, encontra novas possibilidades em madeiras reaproveitadas. Seu fazer combina precisão, cuidado ambiental e respeito pela história de cada material.',
};

function formatPrice(price: number) { return `R$ ${price.toFixed(2).replace('.', ',')}`; }

export default function ProductDetail({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [applauded, setApplauded] = useState(false);
  const [applauseCount, setApplauseCount] = useState(12);
  const [comment, setComment] = useState('');
  const [commentSaved, setCommentSaved] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    const foundProduct = readCatalogProducts().find((item) => item.id === productId);
    setProduct(foundProduct ?? null);
    setActiveImage(0);
  }, [productId]);

  function handleApplause() {
    setApplauded((current) => !current);
    setApplauseCount((current) => current + (applauded ? -1 : 1));
  }

  function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!comment.trim()) return;
    setCommentSaved(true);
    setComment('');
  }

  function handleAddToCart() {
    if (!product) return;
    addToCart(product, selectedQuantity);
    setCartMessage(`${selectedQuantity} ${selectedQuantity === 1 ? 'unidade de' : 'unidades de'} ${product.title} adicionada(s) ao carrinho.`);
  }

  if (!product) return <div className="catalog-empty"><h2>Obra não encontrada</h2><p>Este anúncio pode ter sido removido ou não está mais disponível.</p><a className="catalog-action" href="/">Voltar para a página inicial</a></div>;

  const profile = readArtisanProfile();
  const artisanName = product.artisanName ?? (product.id.startsWith('demo-') ? `Ateliê ${product.artisanCity}` : profile.name);
  const story = product.artisanBio ?? stories[product.artisanCity] ?? profile.bio;
  const galleryImages = [product.mainImage, ...product.additionalImages].filter(Boolean);
  const selectedImage = galleryImages[activeImage] ?? '';

  const relatedProducts = readRelatedProducts(product);
  return (
    <div className="product-detail">
      <div className="product-detail-visual"><div style={{ position: 'relative' }}><button className={`favorite-button${applauded ? ' is-favorite' : ''}`} type="button" onClick={handleApplause} title="aplaudir" aria-label={applauded ? 'Remover aplauso' : 'aplaudir'} aria-pressed={applauded}>👏</button><div className={`marketplace-image marketplace-image-${product.category}`}><span>{selectedImage ? <img src={selectedImage} alt={`${product.title} - imagem ${activeImage + 1}`} /> : 'FORMA'}</span></div></div>{galleryImages.length > 1 && <div className="product-gallery" aria-label="Galeria de imagens da obra">{galleryImages.map((image, index) => <button className={index === activeImage ? 'active' : ''} type="button" key={image} onClick={() => setActiveImage(index)} aria-label={`Ver imagem ${index + 1}`}><img src={image} alt="" /></button>)}</div>}</div>
      <div className="product-detail-copy"><p className="marketplace-category">{product.technique} · {product.artisanCity}</p><h1>{product.title}</h1><p className="product-detail-description">{product.description}</p><strong className="product-detail-price">{formatPrice(product.price)}</strong><p className="product-stock" style={product.stock === 1 ? { color: '#d9534f', fontWeight: 'bold' } : {}}>{product.stock === 1 ? 'último item disponível' : `${product.stock} unidades disponíveis`}</p><div className="payment-box"><h2>Pagamento</h2><p>Até 3x sem juros de {formatPrice(product.price / 3)}</p><p>ou {formatPrice(product.price)} no Pix</p></div><div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginBottom: '16px', width: '100%' }}><div style={{ display: 'flex', flexDirection: 'column' }}><label htmlFor="quantity" style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Quantidade</label><input id="quantity" type="number" min="1" max={product.stock} value={selectedQuantity} onChange={(e) => setSelectedQuantity(Math.min(product.stock, Math.max(1, Number(e.target.value) || 1)))} disabled={product.stock === 0} style={{ width: '80px', height: '48px', padding: '0 12px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center', boxSizing: 'border-box' }} /></div><button className="add-to-cart-button" type="button" onClick={handleAddToCart} disabled={product.stock === 0} style={{ flex: 1, height: '48px', margin: 0, boxSizing: 'border-box' }}>Adicionar ao carrinho</button></div>{cartMessage && <p className="cart-feedback" role="status">{cartMessage} <a href="/carrinho">Ver carrinho</a></p>}</div>
      <section className="artist-story"><p className="eyebrow">QUEM FAZ</p><h2>{artisanName}</h2><p className="artist-location">{product.artisanCity}</p><p>{story}</p><a href={`/artesoes/${artisanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>Conhecer perfil do artesão</a></section><section className="catalog-section"><div className="catalog-heading"><div><p className="eyebrow">VOCÊ TAMBÉM PODE GOSTAR</p><h2>Outras criações</h2></div></div><div className="marketplace-grid">{relatedProducts.map((item) => <a className="marketplace-card" href={`/produtos/${item.id}`} key={item.id}><div className="product-image">{item.mainImage ? <img src={item.mainImage} alt="" /> : <span aria-hidden="true">artpop</span>}</div><div className="product-info"><h3>{item.title}</h3><p>{item.technique}</p><strong>R$ {item.price.toFixed(2).replace('.', ',')}</strong></div></a>)}</div></section>
      <section className="review-section"><div><p className="eyebrow">COMUNIDADE</p><h2>Deixe sua impressão</h2><p>Compartilhe o que essa obra despertou em você.</p></div><form onSubmit={handleComment}><div className="review-author"><ProfileAvatar className="review-avatar" label="Foto do seu perfil" /><strong>LG</strong></div><textarea value={comment} onChange={(event) => { setComment(event.target.value); setCommentSaved(false); }} placeholder="Escreva um comentário ou avaliação" rows={4} aria-label="Comentário ou avaliação" /><button type="submit">Publicar comentário</button>{commentSaved && <small role="status">Seu comentário foi publicado.</small>}</form></section>
    </div>
  );
}