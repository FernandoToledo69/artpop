import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perfil do Artesão",
};

export default function PerfilArtesaoPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Perfil do Artesão</h1>
      <p className="text-gray-600 mb-8">
        Exibindo informações e catálogo do artesão com ID: <span className="font-semibold">{params.id}</span>
      </p>
      
      {/* TODO: Consumir api de artesãos usando a Fake API e listar os detalhes e produtos associados */}
      <div className="bg-gray-100 p-8 rounded-lg text-center text-gray-500">
        Componentes do perfil do artesão serão carregados aqui.
      </div>
    </div>
  );
}

