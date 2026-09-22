import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Detalhes do Pedido",
};

export default function DetalhesPedidoPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Detalhes do Pedido</h1>
      <p className="text-gray-600 mb-8">
        Exibindo informações para o pedido ID: <span className="font-semibold">{params.id}</span>
      </p>
      
      {/* TODO: Consumir api de pedidos usando a Fake API para listar itens, status e resumo */}
      <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500">
        Resumo do pedido será carregado aqui.
      </div>
    </div>
  );
}

