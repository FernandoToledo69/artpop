import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
};

import PaymentForm from '../../components/checkout/PaymentForm';
import ProfileAvatar from '../../components/ui/ProfileAvatar';
import SiteHeader from '../../components/layout/SiteHeader';

export default function CheckoutPage() {
	return <main className="page-shell checkout-page"><SiteHeader /><div className="breadcrumb"><a href="/carrinho">Carrinho</a><span>/</span><strong>Pagamento</strong></div><section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">FINALIZAÇÃO</p><h1>Finalize sua<br /><span className="title-highlight">compra</span></h1><p className="intro-copy">Salve seus dados de pagamento para tornar suas próximas compras mais rápidas.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section><PaymentForm /></main>;
}