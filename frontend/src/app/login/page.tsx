import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

import SiteHeader from '../../components/layout/SiteHeader';
import LoginForm from '../../components/forms/LoginForm';

export default function LoginPage() { return <main className="page-shell auth-page"><SiteHeader minimal /><section className="auth-content"><div className="page-intro"><div className="intro-copy-block"><p className="eyebrow">ACESSO</p><h1>Entre na sua<br /><span className="title-highlight">conta</span></h1><p className="intro-copy">Acompanhe pedidos, favoritos e seus anúncios em um só lugar.</p></div></div><LoginForm /><p className="section-heading">Ainda não tem conta? <a href="/cadastro">Cadastre-se</a></p></section></main>; }
