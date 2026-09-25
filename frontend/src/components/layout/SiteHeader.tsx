'use client';

import CartLink from '../ui/CartLink';
import ProfileAvatar from '../ui/ProfileAvatar';
import { getCurrentUser } from '../../services/api/auth.service';

interface SiteHeaderProps { minimal?: boolean; }

export default function SiteHeader({ minimal = false }: SiteHeaderProps) {
  if (minimal) return <header className="topbar auth-topbar"><a className="brand-link" href="/"><img className="header-logo" src="/artpop_restaurada_alta_resolucao.png" alt="Logomarca artpop" /></a></header>;

  const isLoggedIn = Boolean(getCurrentUser());
  return (
    <header className="topbar">
      <a className="brand-link" href="/"><img className="header-logo" src="/artpop_restaurada_alta_resolucao.png" alt="Logomarca artpop" /></a>
      <form className="site-search" action="/" method="get" role="search">
        <span aria-hidden="true">⌕</span>
        <input name="q" type="search" placeholder="Buscar obras, técnicas ou municípios" aria-label="Buscar obras, técnicas ou municípios" />
        <button type="submit">Buscar</button>
      </form>
      <nav>
        {isLoggedIn ? <><a href="/aplausos">Aplausos</a><a href="/painel-artesao">Área do artesão</a></> : <><a href="/login">Entrar</a><a href="/cadastro">Cadastrar-se</a></>}
        <CartLink />
        {isLoggedIn && <ProfileAvatar label="Abrir perfil" />}
      </nav>
    </header>
  );
}
