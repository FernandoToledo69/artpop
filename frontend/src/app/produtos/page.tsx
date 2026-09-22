import MarketplaceProducts from '../../components/marketplace/MarketplaceProducts';

export default function ProdutosPage() {
	return (
		<main className="page-shell">
			<header className="topbar"><a className="brand-link" href="/"><img className="header-logo" src="/artpop_restaurada_alta_resolucao.png" alt="Logomarca artpop" /></a><nav><a href="/painel-artesao">Meu painel</a><a href="/produtos">Ver vitrine</a><span className="avatar">AL</span></nav></header>
			<div className="breadcrumb"><a href="/">Início</a><span>/</span><strong>Vitrine de obras</strong></div>
			<section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">MARKETPLACE ARTPOP</p><h1>Arte com raízes<br /><span className="title-highlight">perto de você</span></h1><p className="intro-copy">Conheça obras autorais e descubra os artesãos que criam em cada município.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section>
			<MarketplaceProducts />
		</main>
	);
}
