'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../services/api/auth.service';
import PublishedProducts from './PublishedProducts';
import SiteHeader from '../layout/SiteHeader';

export default function ArtisanGate() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (getCurrentUser()?.role !== 'artisan') { router.replace('/login'); return; }
    setAllowed(true);
  }, [router]);
  if (!allowed) return <main className="page-shell"><SiteHeader /><div className="catalog-empty"><p>Verificando sua sessão...</p></div></main>;
  return <main className="page-shell"><SiteHeader /><div className="breadcrumb"><a href="/">Início</a><span>/</span><strong>Meus Produtos</strong></div><section className="page-intro artisan-intro"><div className="intro-copy-block"><p className="eyebrow">PAINEL DO ARTESÃO</p><h1>Meus produtos,<br /><span className="title-highlight">sempre disponíveis</span></h1><p className="intro-copy">Veja suas obras publicadas, acompanhe o estoque e atualize a disponibilidade para venda.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section><PublishedProducts /></main>;
}
