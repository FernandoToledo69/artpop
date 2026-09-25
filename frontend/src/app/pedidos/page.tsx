'use client';

import { useEffect, useState } from 'react';
import SiteHeader from '../../components/layout/SiteHeader';
import { cancelOrder, Order, readOrders } from '../../services/api/pedidos.service';
import LoadingState from '../../components/feedback/LoadingState';
import ErrorState from '../../components/feedback/ErrorState';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
const formatDate = (value: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(new Date(value));

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState('');

  useEffect(() => { try { setOrders(readOrders()); } catch (error) { setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar seus pedidos.'); } finally { setIsLoading(false); } }, []);

  return (
    <main className="page-shell orders-page">
      <SiteHeader />
      <div className="breadcrumb"><a href="/">Início</a><span>/</span><strong>Meus pedidos</strong></div>
      <section className="orders-hero"><div><p className="eyebrow">HISTÓRICO DE COMPRAS</p><h1>Meus<br /><em>pedidos</em></h1><p className="intro-copy">Acompanhe todas as suas compras, incluindo pedidos cancelados.</p></div><span className="favorites-count">{orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}</span></section>
      {isLoading ? <LoadingState message="Carregando seus pedidos..." /> : loadError ? <ErrorState message={loadError} /> : orders.length === 0 ? <section className="cart-empty"><h2>Você ainda não realizou pedidos.</h2><p>Quando finalizar uma compra, ela aparecerá aqui.</p><a className="catalog-action" href="/">Explorar obras</a></section> : <section className="orders-list">{orders.map((order) => <article className="order-card" key={order.id}><header><div><strong>{order.id}</strong><span>Realizado em {formatDate(order.createdAt)}</span></div><span className={`order-status status-${order.status.toLowerCase()}`}>{order.status}</span></header><div className="order-items">{order.items.map((item) => <div key={item.id}><span>{item.quantity}x {item.title}</span><strong>{formatCurrency(item.price * item.quantity)}</strong></div>)}</div><footer><span>{order.payment.brand} terminado em {order.payment.last4}</span><strong>Total {formatCurrency(order.total)}</strong>{order.status !== 'Cancelado' && <button type="button" onClick={() => setOrders(cancelOrder(order.id))}>Cancelar pedido</button>}</footer></article>)}</section>}
    </main>
  );
}
