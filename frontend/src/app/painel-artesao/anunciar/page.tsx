import ProductAnnouncementForm from '../../../components/forms/ProductAnnouncementForm';
import ArtpopMark from '../../../components/ui/ArtpopMark';
import ProfileAvatar from '../../../components/ui/ProfileAvatar';
import CartLink from '../../../components/ui/CartLink';
import SiteHeader from '../../../components/layout/SiteHeader';

export default function AnnounceProductPage() {
  return (
    <main className="page-shell">
      <SiteHeader />
      <div className="breadcrumb"><a href="/painel-artesao">Painel do artesão</a><span>/</span><strong>Anunciar obra</strong></div>
      <section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">CATÁLOGO <span>/</span> NOVA OBRA</p><h1>Publique um anúncio e<br /><span className="title-highlight">torne a sua arte mais popular</span></h1><p className="intro-copy">Compartilhe os detalhes da sua peça com quem valoriza o feito à mão e a história de cada origem.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section>
      <ProductAnnouncementForm />
    </main>
  );
}