import PublishedProducts from '../../components/artesao/PublishedProducts';

export default function PainelArtesaoPage() {
	return (
		<main className="page-shell">
			<header className="topbar"><a className="brand-link" href="/"><img className="header-logo" src="/artpop_restaurada_alta_resolucao.png" alt="Logomarca artpop" /></a><nav><a href="/painel-artesao">Meu painel</a><a href="/produtos">Ver vitrine</a><span className="avatar">AL</span></nav></header>
			<div className="breadcrumb"><a href="/">Início</a><span>/</span><strong>Meus Produtos</strong></div>
			<section className="page-intro artisan-intro"><div className="intro-copy-block"><p className="eyebrow">PAINEL DO ARTESÃO</p><h1>Meus produtos,<br /><span className="title-highlight">sempre disponíveis</span></h1><p className="intro-copy">Veja suas obras publicadas, acompanhe o estoque e atualize a disponibilidade para venda.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section>
			<PublishedProducts />
		</main>
	);
}
