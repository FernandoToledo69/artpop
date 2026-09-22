'use client';

import { useEffect, useMemo, useState } from 'react';
import { readProducts } from '../../services/produtos.service';
import { Product } from '../../types/produto';

export const demoProducts: Product[] = [
  { id: 'stefani-1', title: 'Chromatic Pulse', category: 'outros', technique: 'Colagem digital', price: 198, stock: 5, createdAt: '2026-02-01', artisanCity: 'Recife', artisanName: 'Stefani Germanotta', artisanBio: 'A cultura pop estava na arte, agora a arte está na cultura pop', description: 'Uma composição vibrante que mistura recortes, textura e referências visuais da cultura pop.', mainImage: '', additionalImages: [] },
  { id: 'demo-1', title: 'Vaso Maré Serena', category: 'ceramica', technique: 'Modelagem manual', price: 168, stock: 4, createdAt: '2026-01-10', artisanCity: 'Recife', description: 'Cerâmica de alta temperatura com acabamento natural.', mainImage: '', additionalImages: [] },
  { id: 'demo-2', title: 'Sol de Dentro', category: 'madeira', technique: 'Xilogravura', price: 92, stock: 8, createdAt: '2026-01-12', artisanCity: 'Olinda', description: 'Gravura autoral impressa manualmente em papel algodão.', mainImage: '', additionalImages: [] },
  { id: 'demo-3', title: 'Manta Caminho das Águas', category: 'textil', technique: 'Tear manual', price: 340, stock: 2, createdAt: '2026-01-15', artisanCity: 'Caruaru', description: 'Manta tecida com fios de algodão e lã reciclada.', mainImage: '', additionalImages: [] },
  { id: 'demo-4', title: 'Colar Encanto do Capibaribe', category: 'joalheria', technique: 'Filigrana', price: 245, stock: 3, createdAt: '2026-01-18', artisanCity: 'Recife', description: 'Joia leve inspirada nas águas e pontes da cidade.', mainImage: '', additionalImages: [] },
  { id: 'demo-5', title: 'Tábua Raízes', category: 'madeira', technique: 'Entalhe manual', price: 210, stock: 5, createdAt: '2026-01-20', artisanCity: 'Jaboatão dos Guararapes', description: 'Madeira reaproveitada entalhada peça a peça.', mainImage: '', additionalImages: [] },
  { id: 'demo-6', title: 'Brisa em Fios', category: 'textil', technique: 'Macramê', price: 128, stock: 6, createdAt: '2026-01-22', artisanCity: 'Recife', description: 'Painel decorativo feito com cordão de algodão cru.', mainImage: '', additionalImages: [] },
  { id: 'demo-7', title: 'Casario em Cores', category: 'outros', technique: 'Aquarela', price: 76, stock: 10, createdAt: '2026-01-24', artisanCity: 'Olinda', description: 'Aquarela original sobre papel de algodão.', mainImage: '', additionalImages: [] },
  { id: 'demo-8', title: 'Cumbuca Terra Viva', category: 'ceramica', technique: 'Raku', price: 186, stock: 1, createdAt: '2026-01-26', artisanCity: 'Caruaru', description: 'Peça única queimada em forno raku com esmaltação artesanal.', mainImage: '', additionalImages: [] },
];

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

  useEffect(() => { setProducts([...demoProducts, ...readProducts()]); }, []);

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
    if (sortOrder === 'price-asc') return [...matchingProducts].sort((firstProduct, secondProduct) => firstProduct.price - secondProduct.price);
    return matchingProducts;
  }, [category, municipality, products, query, sortOrder, technique]);

  return (
    <section className="marketplace-section" aria-labelledby="marketplace-title">
      <div className="marketplace-heading"><div><p className="eyebrow">VITRINE DE OBRAS</p><h2 id="marketplace-title">Encontre arte perto de você</h2><p>Explore criações autorais e encontre uma peça com a sua história.</p></div><a className="catalog-action" href="/painel-artesao/anunciar">Anunciar obra</a></div>
      <div className="marketplace-filters"><label>Buscar<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, técnica ou município" /></label><label>Município<select value={municipality} onChange={(event) => setMunicipality(event.target.value)}>{municipalities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Categoria<select value={category} onChange={(event) => setCategory(event.target.value)}>{Object.entries(categories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Técnica<select value={technique} onChange={(event) => setTechnique(event.target.value)}>{techniques.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Ordenar resultados<select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="Ordenar resultados"><option value="relevance">Mais recentes</option><option value="price-asc">Menor Preço</option></select></label></div>
      <p className="marketplace-result" aria-live="polite"><strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'obra encontrada' : 'obras encontradas'}{municipality !== 'Todos os municípios' && <> em <strong>{municipality}</strong></>}</p>
      {filteredProducts.length === 0 ? <div className="catalog-empty"><h3>Nenhuma obra encontrada</h3><p>Ajuste os filtros para descobrir outras criações.</p></div> : <div className="marketplace-grid">{filteredProducts.map((product) => <a className="marketplace-card" href={`/produtos/${product.id}`} key={product.id}><div className={`marketplace-image marketplace-image-${product.category}`}><span aria-hidden="true">{product.mainImage ? <img src={product.mainImage} alt={`Imagem da obra ${product.title}`} /> : product.category === 'ceramica' ? 'FORMA' : product.category === 'madeira' ? 'RAIZ' : product.category === 'textil' ? 'FIO' : product.category === 'joalheria' ? 'LUZ' : 'TRAÇO'}</span></div><div className="marketplace-card-body"><p className="marketplace-category">{categoryLabels[product.category]} · {product.technique}</p><h3>{product.title}</h3><p className="marketplace-city">{product.artisanCity || 'Município não informado'} · {product.stock} disponíveis</p><strong>R$ {product.price.toFixed(2).replace('.', ',')}</strong></div></a>)}</div>}
    </section>
  );
}