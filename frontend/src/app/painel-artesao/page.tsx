import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel do Artesão",
};

import PublishedProducts from '../../components/artesao/PublishedProducts';
import ProfileAvatar from '../../components/ui/ProfileAvatar';
import CartLink from '../../components/ui/CartLink';
import SiteHeader from '../../components/layout/SiteHeader';

export default function PainelArtesaoPage() {
	return (
		<main className="page-shell">
			<SiteHeader />
			<div className="breadcrumb"><a href="/">Início</a><span>/</span><strong>Meus Produtos</strong></div>
			<section className="page-intro artisan-intro"><div className="intro-copy-block"><p className="eyebrow">PAINEL DO ARTESÃO</p><h1>Meus produtos,<br /><span className="title-highlight">sempre disponíveis</span></h1><p className="intro-copy">Veja suas obras publicadas, acompanhe o estoque e atualize a disponibilidade para venda.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section>
			<PublishedProducts />
		</main>
	);
}
