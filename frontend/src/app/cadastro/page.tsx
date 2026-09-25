import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cadastro",
};

import SiteHeader from '../../components/layout/SiteHeader';
import RegisterForm from '../../components/forms/RegisterForm';

export default function CadastroPage() { return <main className="page-shell auth-page"><SiteHeader minimal /><section className="auth-content"><div className="page-intro"><div className="intro-copy-block"><p className="eyebrow">NOVA CONTA</p><h1>Faça parte<br /><span className="title-highlight">da artpop</span></h1><p className="intro-copy">Crie seu acesso para comprar ou publicar suas criações.</p></div></div><RegisterForm /><p className="section-heading">Já tem conta? <a href="/login">Entrar</a></p></section></main>; }
