'use client';

import CartLink from '../ui/CartLink';
import ProfileAvatar from '../ui/ProfileAvatar';

export default function SiteHeader() {
  return (
    <header className="topbar">
      <a className="brand-link" href="/"><img className="header-logo" src="/artpop_restaurada_alta_resolucao.png" alt="Logomarca artpop" /></a>
      <form className="site-search" action="/" method="get" role="search">
        <span aria-hidden="true">⌕</span>
        <input name="q" type="search" placeholder="Buscar obras, técnicas ou municípios" aria-label="Buscar obras, técnicas ou municípios" />
        <button type="submit">Buscar</button>
      </form>
      <nav>
        <a href="/aplausos">Aplausos</a>
        <a href="/painel-artesao">Área do artesão</a>
        <CartLink />
        <ProfileAvatar label="Abrir perfil de LG" />
      </nav>
    </header>
  );
}
