import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel do Artesão",
};

import ArtisanGate from '../../components/artesao/ArtisanGate';

export default function PainelArtesaoPage() {
	return <ArtisanGate />;
}
