'use client';

import { FormEvent, useEffect, useState } from 'react';
import { readProducts } from '../../services/produtos.service';
import { readArtisanProfile } from '../../services/api/usuarios.service';
import { Product } from '../../types/produto';
import { demoProducts } from '../../mocks/products';
import { addToCart } from '../../services/api/carrinho.service';
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

  useEffect(() => {
    const foundProduct = [...demoProducts, ...readProducts()].find((item) => item.id === productId);
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
    addToCart(product);
    setCartMessage(`${product.title} foi adicionada ao carrinho.`);
  }

  if (!product) return <div className="catalog-empty"><h2>Obra não encontrada</h2><p>Este anúncio pode ter sido removido ou não está mais disponível.</p><a className="catalog-action" href="/">Voltar para a página inicial</a></div>;

  const profile = readArtisanProfile();
  const artisanName = product.artisanName ?? (product.id.startsWith('demo-') ? `Ateliê ${product.artisanCity}` : profile.name);
  const story = product.artisanBio ?? stories[product.artisanCity] ?? profile.bio;
  const galleryImages = [product.mainImage, ...product.additionalImages].filter(Boolean);
  const selectedImage = galleryImages[activeImage] ?? '';

  return (
    <div className="product-detail">
      <div className="product-detail-visual"><div className={`marketplace-image marketplace-image-${product.category}`}><span>{selectedImage ? <img src={selectedImage} alt={`${product.title} - imagem ${activeImage + 1}`} /> : 'FORMA'}</span></div>{galleryImages.length > 1 && <div className="product-gallery" aria-label="Galeria de imagens da obra">{galleryImages.map((image, index) => <button className={index === activeImage ? 'active' : ''} type="button" key={image} onClick={() => setActiveImage(index)} aria-label={`Ver imagem ${index + 1}`}><img src={image} alt="" /></button>)}</div>}</div>
      <div className="product-detail-copy"><p className="marketplace-category">{product.technique} · {product.artisanCity}</p><h1>{product.title}</h1><p className="product-detail-description">{product.description}</p><strong className="product-detail-price">{formatPrice(product.price)}</strong><p className="product-stock">{product.stock} unidades disponíveis</p><div className="payment-box"><h2>Pagamento</h2><p>Até 3x sem juros de {formatPrice(product.price / 3)}</p><p>ou {formatPrice(product.price)} no Pix</p></div><button className="add-to-cart-button" type="button" onClick={handleAddToCart}>Adicionar ao carrinho</button>{cartMessage && <p className="cart-feedback" role="status">{cartMessage} <a href="/carrinho">Ver carrinho</a></p>}<button className={`applause-button ${applauded ? 'is-applauded' : ''}`} type="button" onClick={handleApplause}>👏 Aplausos <span>{applauseCount}</span></button></div>
      <section className="artist-story"><p className="eyebrow">QUEM FAZ</p><h2>{artisanName}</h2><p className="artist-location">{product.artisanCity}</p><p>{story}</p><a href="/artesoes">Conhecer perfil do artesão</a></section>
      <section className="review-section"><div><p className="eyebrow">COMUNIDADE</p><h2>Deixe sua impressão</h2><p>Compartilhe o que essa obra despertou em você.</p></div><form onSubmit={handleComment}><div className="review-author"><ProfileAvatar className="review-avatar" label="Foto do seu perfil" /><strong>LG</strong></div><textarea value={comment} onChange={(event) => { setComment(event.target.value); setCommentSaved(false); }} placeholder="Escreva um comentário ou avaliação" rows={4} aria-label="Comentário ou avaliação" /><button type="submit">Publicar comentário</button>{commentSaved && <small role="status">Seu comentário foi publicado.</small>}</form></section>
    </div>
  );
}