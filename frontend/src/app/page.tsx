import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página Inicial",
};

import MarketplaceProducts from '../components/marketplace/MarketplaceProducts';
import ProfileAvatar from '../components/ui/ProfileAvatar';
import CartLink from '../components/ui/CartLink';
import SiteHeader from '../components/layout/SiteHeader';

export default function HomePage() {
	return (
		<main className="page-shell home-page">
			<SiteHeader />
			<MarketplaceProducts />
		</main>
	);
}