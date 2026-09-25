import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artesãos",
};

import PublicArtisanProfile from '../../components/artesao/PublicArtisanProfile';
import ProfileAvatar from '../../components/ui/ProfileAvatar';
import CartLink from '../../components/ui/CartLink';
import SiteHeader from '../../components/layout/SiteHeader';
import { readArtisans } from '../../services/api/artesoes.service';

export default function ArtesoesPage() {
	const artisans = readArtisans();
	return (
		<main className="page-shell">
			<SiteHeader />
			<div className="breadcrumb"><a href="/">Início</a><span>/</span><strong>Perfil público</strong></div>
			<section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">PERFIL PÚBLICO</p><h1>Conheça quem<br /><span className="title-highlight">faz à mão</span></h1><p className="intro-copy">Uma janela para a história e o trabalho por trás de cada criação artpop.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section>
			<div className="marketplace-grid">{artisans.map((artisan) => <a className="marketplace-card" href={`/artesoes/${artisan.id}`} key={artisan.id}><div className="product-image">{artisan.avatarImage ? <img src={artisan.avatarImage} alt="" /> : <span aria-hidden="true">artpop</span>}</div><div className="product-info"><p className="eyebrow">ARTESÃO</p><h2>{artisan.name}</h2><p>{[artisan.city, artisan.state].filter(Boolean).join(' - ')}</p><strong>{artisan.products.length} {artisan.products.length === 1 ? 'obra publicada' : 'obras publicadas'}</strong></div></a>)}</div>
		</main>
	);
}
