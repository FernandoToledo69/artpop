import ArtisanProfileForm from '../../components/artesao/ArtisanProfileForm';

export default function UserProfilePage() {
  return (
    <main className="page-shell">
      <header className="topbar"><a className="brand-link" href="/"><img className="header-logo" src="/artpop_restaurada_alta_resolucao.png" alt="Logomarca artpop" /></a><nav><a href="/">Início</a><a href="/painel-artesao">Meus produtos</a><a className="avatar" href="/perfil" aria-label="Perfil de LG">LG</a></nav></header>
      <div className="breadcrumb"><a href="/">Início</a><span>/</span><strong>Meu perfil</strong></div>
      <section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">USUÁRIO LOGADO</p><h1>Seu perfil,<br /><span className="title-highlight">do seu jeito</span></h1><p className="intro-copy">Atualize seus dados pessoais e acompanhe as obras publicadas pela sua conta.</p></div><div className="intro-brand"><span className="profile-initials profile-hero-initials">LG</span></div></section>
      <ArtisanProfileForm />
    </main>
  );
}