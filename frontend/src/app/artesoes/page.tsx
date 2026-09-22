import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Artesãos",
};

import PublicArtisanProfile from '../../components/artesao/PublicArtisanProfile';
import ProfileAvatar from '../../components/ui/ProfileAvatar';
import CartLink from '../../components/ui/CartLink';
import SiteHeader from '../../components/layout/SiteHeader';

export default function ArtesoesPage() {
	return (
		<main className="page-shell">
			<SiteHeader />
			<div className="breadcrumb"><a href="/">Início</a><span>/</span><strong>Perfil público</strong></div>
			<section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">PERFIL PÚBLICO</p><h1>Conheça quem<br /><span className="title-highlight">faz à mão</span></h1><p className="intro-copy">Uma janela para a história e o trabalho por trás de cada criação artpop.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section>
			<PublicArtisanProfile />
		</main>
	);
}
