import type { Metadata } from "next";
import OrderDetail from '../../../components/orders/OrderDetail';

export const metadata: Metadata = {
  title: "Detalhes do Pedido",
};

export default function DetalhesPedidoPage({ params }: { params: { id: string } }) {
  return <OrderDetail orderId={params.id} />;
}

