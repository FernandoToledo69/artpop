import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meu Perfil",
};

import ArtisanProfileForm from '../../components/artesao/ArtisanProfileForm';
import ProfileAvatar from '../../components/ui/ProfileAvatar';
import CartLink from '../../components/ui/CartLink';
import SiteHeader from '../../components/layout/SiteHeader';

export default function UserProfilePage() {
  return (
    <main className="page-shell">
      <SiteHeader />
      <div className="breadcrumb"><a href="/">Início</a><span>/</span><strong>Meu perfil</strong></div>
      <section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">USUÁRIO LOGADO</p><h1>Seu perfil,<br /><span className="title-highlight">do seu jeito</span></h1><p className="intro-copy">Atualize seus dados pessoais e acompanhe as obras publicadas pela sua conta.</p></div><div className="intro-brand"><ProfileAvatar className="profile-initials profile-hero-initials" label="Foto do perfil" withMenu={false} /></div></section>
      <ArtisanProfileForm />
    </main>
  );
}