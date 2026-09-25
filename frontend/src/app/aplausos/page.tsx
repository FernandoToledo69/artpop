'use client';

import { useEffect, useState } from 'react';
import { readCatalogProducts } from '../../services/api/produtos.service';
import { readFavoriteIds, toggleFavorite } from '../../services/api/favoritos.service';
import { Product } from '../../types/produto';
import SiteHeader from '../../components/layout/SiteHeader';
import LoadingState from '../../components/feedback/LoadingState';
import ErrorState from '../../components/feedback/ErrorState';

export default function ApplausePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => { try { setProducts(readCatalogProducts()); setFavoriteIds(readFavoriteIds()); } catch (error) { setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar seus aplausos.'); } finally { setIsLoading(false); } }, []);

  const favorites = products.filter((product) => favoriteIds.includes(product.id));

  return (
    <main className="page-shell favorites-page">
      <SiteHeader />
      <div className="breadcrumb"><a href="/">Início</a><span>/</span><strong>Aplausos</strong></div>
      <section className="applause-hero"><div><p className="eyebrow">ARTPOP <span>/</span> MINHA LISTA</p><h1>Obras que<br /><em className="applause-highlight">inspiram você</em></h1><p className="intro-copy">Guarde suas criações preferidas para reencontrá-las quando quiser.</p></div></section>
      <p className="applause-result-count">{favorites.length} {favorites.length === 1 ? 'obra aplaudida' : 'obras aplaudidas'}</p>
      {isLoading ? <LoadingState message="Carregando seus aplausos..." /> : loadError ? <ErrorState message={loadError} /> : favorites.length === 0 ? <section className="cart-empty"><h2>Nenhuma obra aplaudida ainda.</h2><p>Explore a vitrine e toque nas palmas para criar sua lista.</p><a className="catalog-action" href="/">Explorar obras</a></section> : <div className="marketplace-grid favorites-grid">{favorites.map((product) => <a className="marketplace-card" href={`/produtos/${product.id}`} key={product.id}><button className="favorite-button is-favorite" type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setFavoriteIds(toggleFavorite(product.id)); }} aria-label={`Remover aplauso de ${product.title}`}>👏</button><div className={`marketplace-image marketplace-image-${product.category}`}>{product.mainImage ? <img src={product.mainImage} alt={product.title} /> : <span aria-hidden="true">FORMA</span>}</div><div className="marketplace-card-body"><p className="marketplace-category">{product.technique} · {product.artisanCity}</p><h3>{product.title}</h3><strong>R$ {product.price.toFixed(2).replace('.', ',')}</strong></div></a>)}</div>}
    </main>
  );
}
