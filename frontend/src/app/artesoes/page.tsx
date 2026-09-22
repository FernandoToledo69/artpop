import PublicArtisanProfile from '../../components/artesao/PublicArtisanProfile';

export default function ArtesoesPage() {
	return (
		<main className="page-shell">
			<header className="topbar"><a className="brand-link" href="/"><img className="header-logo" src="/artpop_restaurada_alta_resolucao.png" alt="Logomarca artpop" /></a><nav><a href="/painel-artesao">Meu painel</a><a className="avatar" href="/perfil" aria-label="Abrir perfil de LG">LG</a></nav></header>
			<div className="breadcrumb"><a href="/">Início</a><span>/</span><strong>Perfil público</strong></div>
			<section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">PERFIL PÚBLICO</p><h1>Conheça quem<br /><span className="title-highlight">faz à mão</span></h1><p className="intro-copy">Uma janela para a história e o trabalho por trás de cada criação artpop.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section>
			<PublicArtisanProfile />
		</main>
	);
}
