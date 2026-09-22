import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gerenciar Pedidos",
};

export default function PainelArtesaoPedidosPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Gerenciamento de Pedidos</h1>
      <p className="text-gray-600 mb-8">
        Área dedicada para o artesão visualizar e gerenciar os pedidos recebidos.
      </p>
      
      {/* TODO: Consumir api de pedidos (Fake API) para listar as vendas realizadas */}
      <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500">
        Lista de pedidos do artesão aparecerá aqui.
      </div>
    </div>
  );
}

