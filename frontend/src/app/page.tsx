import MarketplaceProducts from '../components/marketplace/MarketplaceProducts';
import ProfileAvatar from '../components/ui/ProfileAvatar';
import CartLink from '../components/ui/CartLink';
import SiteHeader from '../components/layout/SiteHeader';

export default function HomePage() {
	return (
		<main className="page-shell home-page">
			<SiteHeader />
			<section className="home-hero"><div><p className="eyebrow">ARTPOP <span>/</span> FEITO À MÃO</p><h1>Encontre uma peça<br /><span className="title-highlight">com alma</span></h1><p>Obras autorais, técnicas ancestrais e novos fazeres reunidos em um só lugar.</p></div><div className="home-hero-stamp"><strong>feito</strong><span>por muitas mãos</span></div></section>
			<MarketplaceProducts />
		</main>
	);
}