import MarketplaceProducts from '../components/marketplace/MarketplaceProducts';

export default function HomePage() {
	return (
		<main className="page-shell home-page">
			<header className="topbar"><a className="brand-link" href="/"><img className="header-logo" src="/artpop_restaurada_alta_resolucao.png" alt="Logomarca artpop" /></a><nav><a href="/painel-artesao">Área do artesão</a><a className="avatar" href="/perfil" aria-label="Abrir perfil de LG">LG</a></nav></header>
			<section className="home-hero"><div><p className="eyebrow">ARTPOP <span>/</span> FEITO À MÃO</p><h1>Encontre uma peça<br /><span className="title-highlight">com alma</span></h1><p>Obras autorais, técnicas ancestrais e novos fazeres reunidos em um só lugar.</p></div><div className="home-hero-stamp"><strong>feito</strong><span>por muitas mãos</span></div></section>
			<MarketplaceProducts />
		</main>
	);
}