import ArtisanProfileForm from '../../../components/artesao/ArtisanProfileForm';

export default function ArtisanProfilePage() {
  return (
    <main className="page-shell">
      <header className="topbar"><a className="brand-link" href="/"><img className="header-logo" src="/artpop_restaurada_alta_resolucao.png" alt="Logomarca artpop" /></a><nav><a href="/painel-artesao">Meus produtos</a><a href="/artesoes">Ver perfil público</a><a className="avatar" href="/perfil" aria-label="Abrir perfil de LG">LG</a></nav></header>
      <div className="breadcrumb"><a href="/painel-artesao">Painel do artesão</a><span>/</span><strong>Meu cadastro</strong></div>
      <section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">PERFIL DO ARTESÃO</p><h1>Cuide dos seus dados<br /><span className="title-highlight">com liberdade</span></h1><p className="intro-copy">Mantenha seu telefone e endereço atualizados para que seu perfil público conte a história certa.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section>
      <ArtisanProfileForm />
    </main>
  );
}