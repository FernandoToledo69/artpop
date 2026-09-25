import type { Metadata } from "next";
import SiteHeader from '../../../components/layout/SiteHeader';
import { readArtisanById } from '../../../services/api/artesoes.service';

export const metadata: Metadata = {
  title: "Perfil do Artesão",
};

export default async function PerfilArtesaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artisan = readArtisanById(id);
  if (!artisan) return <main className="page-shell"><SiteHeader /><section className="catalog-empty"><h1>Artesão não encontrado</h1><a className="catalog-action" href="/artesoes">Voltar aos artesãos</a></section></main>;
  return (
    <main className="page-shell"><SiteHeader /><div className="breadcrumb"><a href="/artesoes">Artesãos</a><span>/</span><strong>{artisan.name}</strong></div><section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">PERFIL DO ARTESÃO</p><h1>{artisan.name}</h1><p className="intro-copy">{artisan.bio}</p><p>{[artisan.city, artisan.state].filter(Boolean).join(' - ')}</p></div></section><section className="public-profile"><div className="profile-avatar">{artisan.avatarImage ? <img src={artisan.avatarImage} alt={`Foto de ${artisan.name}`} /> : 'LG'}</div><div><p className="eyebrow">CATÁLOGO</p><h2>{artisan.products.length} obras disponíveis</h2><p>{artisan.phone}</p></div></section><div className="marketplace-grid">{artisan.products.map((product) => <a className="marketplace-card" href={`/produtos/${product.id}`} key={product.id}><div className="product-image">{product.mainImage ? <img src={product.mainImage} alt="" /> : <span aria-hidden="true">artpop</span>}</div><div className="product-info"><h3>{product.title}</h3><p>{product.technique}</p><strong>R$ {product.price.toFixed(2).replace('.', ',')}</strong></div></a>)}</div></main>
  );
}

