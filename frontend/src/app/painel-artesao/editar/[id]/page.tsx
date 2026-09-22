import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar Obra",
};

import ProductEditForm from '../../../../components/forms/ProductEditForm';
import ProfileAvatar from '../../../../components/ui/ProfileAvatar';
import CartLink from '../../../../components/ui/CartLink';
import SiteHeader from '../../../../components/layout/SiteHeader';

export default function EditProductPage({ params }: { params: { id: string } }) {
	return (
		<main className="page-shell">
			<SiteHeader />
			<div className="breadcrumb"><a href="/painel-artesao">Painel do artesão</a><span>/</span><strong>Editar obra</strong></div>
			<section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">CATÁLOGO <span>/</span> EDITAR OBRA</p><h1>Enriqueça a apresentação<br /><span className="title-highlight">da sua criação</span></h1><p className="intro-copy">Atualize as informações e adicione fotos que revelem novos detalhes da sua obra.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section>
			<ProductEditForm productId={params.id} />
		</main>
	);
}