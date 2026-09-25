'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PaymentForm from './PaymentForm';
import SiteHeader from '../layout/SiteHeader';
import { getCurrentUser } from '../../services/api/auth.service';

export default function CheckoutGate() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    if (!getCurrentUser()) {
      router.replace('/login');
      return;
    }
    setIsCheckingSession(false);
  }, [router]);

  if (isCheckingSession) return <main className="page-shell checkout-page"><SiteHeader /><div className="catalog-empty"><p>Verificando sua sessão...</p></div></main>;

  return <main className="page-shell checkout-page"><SiteHeader /><div className="breadcrumb"><a href="/carrinho">Carrinho</a><span>/</span><strong>Pagamento</strong></div><section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">FINALIZAÇÃO</p><h1>Finalize sua<br /><span className="title-highlight">compra</span></h1><p className="intro-copy">Salve seus dados de pagamento para tornar suas próximas compras mais rápidas.</p></div><div className="intro-brand"><img className="hero-logo" src="/artpop-branco.png" alt="Logomarca artpop branca" /></div></section><PaymentForm /></main>;
}
