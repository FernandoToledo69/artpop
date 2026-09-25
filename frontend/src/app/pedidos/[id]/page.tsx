import type { Metadata } from "next";
import OrderDetail from '../../../components/orders/OrderDetail';

export const metadata: Metadata = {
  title: "Detalhes do Pedido",
};

export default async function DetalhesPedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}

