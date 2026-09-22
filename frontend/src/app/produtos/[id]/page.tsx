import ProductDetail from '../../../components/marketplace/ProductDetail';
import ProfileAvatar from '../../../components/ui/ProfileAvatar';
import CartLink from '../../../components/ui/CartLink';
import SiteHeader from '../../../components/layout/SiteHeader';

export default async function ProductPage({ params }: { params: { id: string } }) {
  return (
    <main className="page-shell">
      <SiteHeader />
      <div className="breadcrumb"><a href="/">Página inicial</a><span>/</span><strong>Detalhe da obra</strong></div>
      <ProductDetail productId={params.id} />
    </main>
  );
}