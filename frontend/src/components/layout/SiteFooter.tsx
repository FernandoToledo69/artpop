export default function SiteFooter() {
  return (
    <footer className="site-footer global-footer">
      <div className="footer-brand"><span className="footer-logo"><img src="/artpop-logo-original.png" alt="artpop" /></span><span>Torne a sua arte mais popular</span></div>
      <div className="footer-column"><strong>Siga a artpop</strong><div className="social-links"><a href="#instagram">Instagram</a><a href="#facebook">Facebook</a><a href="#pinterest">Pinterest</a></div></div>
      <div className="footer-column"><strong>Precisa de ajuda?</strong><a href="/central-de-ajuda">Central de ajuda</a><a href="/contato">Contato</a><a href="/faq">Perguntas frequentes</a></div>
      <div className="footer-column"><strong>Sobre a artpop</strong><a href="/trabalhe-conosco">Trabalhe conosco</a><a href="/programa-transporte-afiliados">Programa de transporte para afiliados</a><a href="/termos-e-condicoes">Termos e condições</a><a href="/privacidade">Política de privacidade</a><a href="/acessibilidade">Acessibilidade</a></div>
      <p className="copyright">© 2026 artpop. Todos os direitos reservados.</p>
    </footer>
  );
}