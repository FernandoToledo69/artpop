'use client';

import { useEffect, useState } from 'react';
import SiteHeader from '../layout/SiteHeader';
import { AdminSnapshot, fetchPendingArtisans, moderateArtisan, PendingArtisan, readAdminSnapshot, updateOrderStatus } from '../../services/api/admin.service';
import { Order, OrderStatus } from '../../services/api/pedidos.service';
import { Product } from '../../types/produto';
import LoadingState from '../feedback/LoadingState';
import ErrorState from '../feedback/ErrorState';
import { getCurrentUser } from '../../services/api/auth.service';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<AdminSnapshot>({ products: [], orders: [], artisans: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [pendingArtisans, setPendingArtisans] = useState<PendingArtisan[]>([]);
  const [moderationError, setModerationError] = useState('');
  const [moderationMessage, setModerationMessage] = useState('');
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [moderatingId, setModeratingId] = useState('');
  useEffect(() => {
    if (getCurrentUser()?.role !== 'admin') { router.replace('/login'); return; }
    try { setData(readAdminSnapshot()); } catch (error) { setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar o painel.'); }
    fetchPendingArtisans()
      .then(setPendingArtisans)
      .catch((error: unknown) => setModerationError(error instanceof Error ? error.message : 'Não foi possível carregar a fila de curadoria.'))
      .finally(() => setIsLoading(false));
  }, [router]);
  function changeStatus(order: Order, status: OrderStatus) { setData({ ...data, orders: updateOrderStatus(order.id, status) }); }
  async function reviewArtisan(artisan: PendingArtisan, status: 'ACTIVE' | 'REJECTED') {
    const reason = rejectionReasons[artisan.id]?.trim();
    if (status === 'REJECTED' && !reason) {
      setModerationError('Informe a justificativa para reprovar o cadastro.');
      return;
    }
    setModerationError('');
    setModerationMessage('');
    setModeratingId(artisan.id);
    try {
      await moderateArtisan(artisan.id, status, reason);
      setPendingArtisans((current) => current.filter((item) => item.id !== artisan.id));
      setModerationMessage(status === 'ACTIVE' ? 'Cadastro aprovado.' : 'Cadastro reprovado; e-mail enviado ao solicitante.');
    } catch (error) {
      setModerationError(error instanceof Error ? error.message : 'Não foi possível moderar este cadastro.');
    } finally {
      setModeratingId('');
    }
  }
  return <main className="page-shell"><SiteHeader /><section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">ADMINISTRAÇÃO</p><h1>Visão geral<br /><span className="title-highlight">da artpop</span></h1><p className="intro-copy">Acompanhe o catálogo, os artesãos e os pedidos da plataforma.</p></div></section>{isLoading ? <LoadingState message="Carregando o painel..." /> : loadError ? <ErrorState message={loadError} /> : <><section className="marketplace-grid"><article className="catalog-summary"><strong>{data.products.length}</strong><span> produtos</span></article><article className="catalog-summary"><strong>{data.artisans.length}</strong><span> artesãos</span></article><article className="catalog-summary"><strong>{data.orders.length}</strong><span> pedidos</span></article></section><section className="catalog-section"><div className="catalog-heading"><div><p className="eyebrow">CURADORIA</p><h2>Cadastros pendentes</h2></div></div>{moderationError && <p className="error" role="alert">{moderationError}</p>}{moderationMessage && <p className="success-message moderation-feedback" role="status">{moderationMessage}</p>}{pendingArtisans.length === 0 && !moderationError ? <div className="catalog-empty"><p>Nenhum cadastro aguardando análise.</p></div> : <div className="artisan-review-list">{pendingArtisans.map((artisan) => <article className="artisan-review-card" key={artisan.id}><div className="product-info"><h3>{artisan.name}</h3><p>{artisan.user.email} · {[artisan.city, artisan.state].filter(Boolean).join(' - ') || 'Localização não informada'}</p><p>{artisan.bio || 'Sem apresentação informada.'}</p></div><label className="field">Justificativa para reprovação<textarea value={rejectionReasons[artisan.id] ?? ''} onChange={(event) => setRejectionReasons((current) => ({ ...current, [artisan.id]: event.target.value }))} maxLength={1000} /></label><div className="artisan-review-actions"><button type="button" disabled={Boolean(moderatingId)} onClick={() => reviewArtisan(artisan, 'ACTIVE')}>{moderatingId === artisan.id ? 'Salvando...' : 'Aprovar'}</button><button type="button" disabled={Boolean(moderatingId)} onClick={() => reviewArtisan(artisan, 'REJECTED')}>Reprovar</button></div></article>)}</div>}</section><section className="catalog-section"><div className="catalog-heading"><div><p className="eyebrow">CATÁLOGO</p><h2>Produtos publicados</h2></div></div><div className="product-list">{data.products.map((product: Product) => <article className="product-row" key={product.id}><div className="product-info"><h3>{product.title}</h3><p>{product.artisanName ?? product.artisanCity} · estoque: {product.stock}</p></div><a className="edit-product-link" href={`/produtos/${product.id}`}>Ver anúncio</a></article>)}</div></section><section className="catalog-section"><div className="catalog-heading"><div><p className="eyebrow">OPERAÇÃO</p><h2>Pedidos recentes</h2></div></div>{data.orders.length === 0 ? <div className="catalog-empty"><p>Nenhum pedido registrado.</p></div> : data.orders.map((order) => <article className="product-row" key={order.id}><div className="product-info"><h3>{order.id}</h3><p>R$ {order.total.toFixed(2).replace('.', ',')} · {order.items.length} item(ns)</p></div><select value={order.status} onChange={(event) => changeStatus(order, event.target.value as OrderStatus)}><option>Pendente</option><option>Enviado</option><option>Concluído</option><option>Cancelado</option></select></article>)}</section></>}</main>;
}