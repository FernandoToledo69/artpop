import ProductDetail from '../../../components/marketplace/ProductDetail';

export default async function ProductPage({ params }: { params: { id: string } }) {
  return (
    <main className="page-shell">
      <header className="topbar"><a className="brand-link" href="/"><img className="header-logo" src="/artpop_restaurada_alta_resolucao.png" alt="Logomarca artpop" /></a><nav><a href="/">Página inicial</a><a href="/painel-artesao">Área do artesão</a><a className="avatar" href="/perfil" aria-label="Abrir perfil de LG">LG</a></nav></header>
      <div className="breadcrumb"><a href="/">Página inicial</a><span>/</span><strong>Detalhe da obra</strong></div>
      <ProductDetail productId={params.id} />
    </main>
  );
}