import ProductAnnouncementForm from '../../../components/forms/ProductAnnouncementForm';
import ArtpopMark from '../../../components/ui/ArtpopMark';

export default function AnnounceProductPage() {
  return (
    <main className="page-shell">
      <header className="topbar"><a className="brand-link" href="/"><img className="header-logo" src="/artpop_restaurada_alta_resolucao.png" alt="Logomarca artpop" /></a><nav><a href="/painel-artesao">Meu painel</a><a href="/produtos">Ver vitrine</a><span className="avatar">AL</span></nav></header>
      <div className="breadcrumb"><a href="/painel-artesao">Painel do artesão</a><span>/</span><strong>Anunciar obra</strong></div>
      <section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">CATÁLOGO <span>/</span> NOVA OBRA</p><h1>Publique um anúncio e<br /><span className="title-highlight">torne a sua arte mais popular</span></h1><p className="intro-copy">Compartilhe os detalhes da sua peça com quem valoriza o feito à mão e a história de cada origem.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section>
      <ProductAnnouncementForm />
      <footer className="site-footer">
        <div className="footer-brand"><span className="footer-logo"><img src="/artpop-logo-original.png" alt="artpop" /></span><span>Torne a sua arte mais popular</span></div>
        <div className="footer-column"><strong>Siga a artpop</strong><div className="social-links"><a href="#instagram">Instagram</a><a href="#facebook">Facebook</a><a href="#pinterest">Pinterest</a></div></div>
        <div className="footer-column"><strong>Precisa de ajuda?</strong><a href="/central-de-ajuda">Central de ajuda</a><a href="/contato">Contato</a><a href="/faq">Perguntas frequentes</a></div>
        <div className="footer-column"><strong>Sobre a artpop</strong><a href="/trabalhe-conosco">Trabalhe conosco</a><a href="/programa-transporte-afiliados">Programa de transporte para afiliados</a><a href="/termos-e-condicoes">Termos e condições</a><a href="/privacidade">Política de privacidade</a><a href="/acessibilidade">Acessibilidade</a></div>
        <p className="copyright">© 2026 artpop. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}