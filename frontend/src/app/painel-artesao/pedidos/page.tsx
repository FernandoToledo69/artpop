import type { Metadata } from "next";
import ArtisanOrders from '../../../components/orders/ArtisanOrders';

export const metadata: Metadata = {
  title: "Gerenciar Pedidos",
};

export default function PainelArtesaoPedidosPage() {
  return <ArtisanOrders />;
}

