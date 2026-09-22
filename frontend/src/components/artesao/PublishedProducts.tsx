'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { readProducts, updateProductStock } from '../../services/api/produtos.service';
import { Product } from '../../types/produto';
import { demoProducts } from '../../mocks/products';

const categoryLabels: Record<Product['category'], string> = {
  ceramica: 'Cerâmica', madeira: 'Madeira', textil: 'Têxtil', joalheria: 'Joalheria', outros: 'Outros', '': 'Sem categoria',
};

export default function PublishedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState('');
  const [savedProductId, setSavedProductId] = useState('');

  useEffect(() => { setProducts([...demoProducts.filter((product) => product.artisanName === 'Stefani Germanotta'), ...readProducts()]); }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');
    if (!normalizedQuery) return products;
    return products.filter((product) => [product.title, product.category, product.technique].join(' ').toLocaleLowerCase('pt-BR').includes(normalizedQuery));
  }, [products, query]);

  function handleStockChange(productId: string, event: ChangeEvent<HTMLInputElement>) {
    const stock = Math.max(0, Number(event.target.value) || 0);
    setProducts((currentProducts) => currentProducts.map((product) => product.id === productId ? { ...product, stock } : product));
    setSavedProductId('');
  }

  function saveStock(product: Product) {
    updateProductStock(product.id, product.stock, product);
    setSavedProductId(product.id);
    window.setTimeout(() => setSavedProductId(''), 2200);
  }

  return (
    <section className="catalog-section" aria-labelledby="catalog-title">
      <div className="catalog-heading">
        <div><p className="eyebrow">MEUS PRODUTOS</p><h2 id="catalog-title">Minhas obras publicadas</h2><p>Consulte suas obras e mantenha a quantidade em estoque sempre atualizada.</p></div>
        <a className="catalog-action" href="/painel-artesao/anunciar">+ Anunciar obra</a>
      </div>
      <label className="catalog-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, categoria ou técnica" aria-label="Buscar obras publicadas" /></label>
      <div className="catalog-summary" aria-live="polite"><strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'obra encontrada' : 'obras encontradas'}</div>
      {products.length === 0 ? (
        <div className="catalog-empty"><h3>Seu catálogo ainda está vazio</h3><p>Publique sua primeira obra para acompanhar a disponibilidade por aqui.</p><a className="catalog-action" href="/painel-artesao/anunciar">Publicar primeira obra</a></div>
      ) : filteredProducts.length === 0 ? (
        <div className="catalog-empty"><h3>Nenhuma obra encontrada</h3><p>Tente buscar por outro nome, categoria ou técnica.</p></div>
      ) : (
        <div className="product-list">{filteredProducts.map((product) => (
          <article className="product-row" key={product.id}>
            <div className="product-image">{product.mainImage ? <img src={product.mainImage} alt="" /> : <span aria-hidden="true">artpop</span>}</div>
            <div className="product-info"><h3>{product.title}</h3><p>{categoryLabels[product.category]} · {product.technique}</p><strong>R$ {product.price.toFixed(2).replace('.', ',')}</strong></div>
            <div className="stock-control"><label htmlFor={`stock-${product.id}`}>Estoque disponível</label><div className="stock-input"><input id={`stock-${product.id}`} type="number" min="0" step="1" value={product.stock} onChange={(event) => handleStockChange(product.id, event)} /><span>un.</span></div><button type="button" onClick={() => saveStock(product)}>Confirmar estoque</button><a className="edit-product-link" href={`/painel-artesao/editar/${product.id}`}>Editar anúncio</a><a className="edit-product-link" href={`/produtos/${product.id}`} style={{ marginLeft: '12px' }}>Ver página da obra</a>{savedProductId === product.id && <small role="status">Estoque atualizado</small>}</div>
          </article>
        ))}</div>
      )}
    </section>
  );
}