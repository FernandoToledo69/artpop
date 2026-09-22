'use client';

import type { MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { readProducts } from '../../services/produtos.service';
import { Product } from '../../types/produto';
import { demoProducts } from '../../mocks/products';
import { readFavoriteIds, toggleFavorite } from '../../services/api/favoritos.service';

export { demoProducts } from '../../mocks/products';

const municipalities = ['Todos os municípios', 'Recife', 'Olinda', 'Jaboatão dos Guararapes', 'Caruaru'];
const categories = { all: 'Todas as categorias', ceramica: 'Cerâmica', madeira: 'Madeira', textil: 'Têxtil', joalheria: 'Joalheria', outros: 'Outros' };
const categoryLabels: Record<Product['category'], string> = { ceramica: 'Cerâmica', madeira: 'Madeira', textil: 'Têxtil', joalheria: 'Joalheria', outros: 'Outros', '': 'Outros' };

export default function MarketplaceProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [municipality, setMunicipality] = useState('Todos os municípios');
  const [category, setCategory] = useState('all');
  const [technique, setTechnique] = useState('Todas as técnicas');
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('relevance');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => { setProducts([...demoProducts, ...readProducts()]); setFavoriteIds(readFavoriteIds()); setQuery(new URLSearchParams(window.location.search).get('q') ?? ''); }, []);

  function handleFavorite(event: MouseEvent<HTMLButtonElement>, productId: string) {
    event.preventDefault();
    event.stopPropagation();
    setFavoriteIds(toggleFavorite(productId));
  }

  const techniques = useMemo(() => ['Todas as técnicas', ...Array.from(new Set(products.map((product) => product.technique))).sort()], [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    const matchingProducts = products.filter((product) => {
      const matchesMunicipality = municipality === 'Todos os municípios' || product.artisanCity.toLocaleLowerCase('pt-BR') === municipality.toLocaleLowerCase('pt-BR');
      const matchesCategory = category === 'all' || product.category === category;
      const matchesTechnique = technique === 'Todas as técnicas' || product.technique === technique;
      const matchesQuery = !normalizedQuery || [product.title, product.technique, product.artisanCity].join(' ').toLocaleLowerCase('pt-BR').includes(normalizedQuery);
      return matchesMunicipality && matchesCategory && matchesTechnique && matchesQuery;
    });
    return [...matchingProducts].sort((firstProduct, secondProduct) => {
      if (sortOrder === 'price-asc') return firstProduct.price - secondProduct.price;
      if (sortOrder === 'price-desc') return secondProduct.price - firstProduct.price;
      if (sortOrder === 'oldest') return new Date(firstProduct.createdAt).getTime() - new Date(secondProduct.createdAt).getTime();
      if (sortOrder === 'title-asc') return firstProduct.title.localeCompare(secondProduct.title, 'pt-BR');
      return new Date(secondProduct.createdAt).getTime() - new Date(firstProduct.createdAt).getTime();
    });
  }, [category, municipality, products, query, sortOrder, technique]);

  return (
    <section className="marketplace-section" aria-labelledby="marketplace-title">
      <div className="marketplace-heading"><div><p className="eyebrow">VITRINE DE OBRAS</p><h2 id="marketplace-title">Encontre arte perto de você</h2><p>Explore criações autorais e encontre uma peça com a sua história.</p></div><a className="catalog-action" href="/painel-artesao/anunciar">Anunciar obra</a></div>
      <div className="marketplace-filters"><label>Município<select value={municipality} onChange={(event) => setMunicipality(event.target.value)}>{municipalities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Categoria<select value={category} onChange={(event) => setCategory(event.target.value)}>{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Técnica<select value={technique} onChange={(event) => setTechnique(event.target.value)}>{techniques.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Ordenar resultados<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Ordenar resultados"><option value="relevance">Mais recentes</option><option value="oldest">Mais antigas</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="title-asc">Ordem alfabética</option></select></label></div>
      <p className="marketplace-result" aria-live="polite"><strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'obra encontrada' : 'obras encontradas'}{municipality !== 'Todos os municípios' && <> em <strong>{municipality}</strong></>}</p>
      {filteredProducts.length === 0 ? <div className="catalog-empty"><h3>Nenhuma obra encontrada</h3><p>Ajuste os filtros para descobrir outras criações.</p></div> : <div className="marketplace-grid">{filteredProducts.map((product) => <a className="marketplace-card" href={`/produtos/${product.id}`} key={product.id}><button className={`favorite-button${favoriteIds.includes(product.id) ? ' is-favorite' : ''}`} type="button" onClick={(event) => handleFavorite(event, product.id)} aria-label={favoriteIds.includes(product.id) ? `Remover aplauso de ${product.title}` : `Aplaudir ${product.title}`} aria-pressed={favoriteIds.includes(product.id)}>{favoriteIds.includes(product.id) ? '👏' : '👏'}</button><div className={`marketplace-image marketplace-image-${product.category}`}><span aria-hidden="true">{product.mainImage ? <img src={product.mainImage} alt={`Imagem da obra ${product.title}`} /> : product.category === 'ceramica' ? 'FORMA' : product.category === 'madeira' ? 'RAIZ' : product.category === 'textil' ? 'FIO' : product.category === 'joalheria' ? 'LUZ' : 'TRAÇO'}</span></div><div className="marketplace-card-body"><p className="marketplace-category">{categoryLabels[product.category]} · {product.technique}</p><h3>{product.title}</h3><p className="marketplace-city">{product.artisanCity || 'Município não informado'} · {product.stock} disponíveis</p><strong>R$ {product.price.toFixed(2).replace('.', ',')}</strong></div></a>)}</div>}
    </section>
  );
}