'use client';

import { useEffect, useState } from 'react';
import SiteHeader from '../layout/SiteHeader';
import { Order, OrderStatus, readAllOrders, updateArtisanOrderStatus } from '../../services/api/pedidos.service';
import { getCurrentUser } from '../../services/api/auth.service';

export default function ArtisanOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const artisanId = getCurrentUser()?.artisanId;
  useEffect(() => setOrders(artisanId ? readAllOrders().filter((order) => order.items.some((item) => item.artisanId === artisanId)) : []), [artisanId]);
  function update(orderId: string, status: OrderStatus) {
    if (!artisanId) return;
    updateArtisanOrderStatus(orderId, status, artisanId);
    setOrders(artisanId ? readAllOrders().filter((order) => order.items.some((item) => item.artisanId === artisanId)) : []);
  }
  return <main className="page-shell"><SiteHeader /><section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">VENDAS</p><h1>Pedidos<br /><span className="title-highlight">recebidos</span></h1><p className="intro-copy">Acompanhe e atualize o status das compras das suas obras.</p></div></section><section className="catalog-section">{orders.length === 0 ? <div className="catalog-empty"><h2>Nenhuma venda ainda</h2><p>Os pedidos das suas obras aparecerão aqui.</p></div> : orders.map((order) => <article className="product-row" key={order.id}><div className="product-info"><p className="eyebrow">{order.id}</p><h3>{order.items.map((item) => item.title).join(', ')}</h3><p>R$ {order.total.toFixed(2).replace('.', ',')} · {order.status}</p></div><select value={order.status} onChange={(event) => update(order.id, event.target.value as OrderStatus)}><option>Pendente</option><option>Enviado</option><option>Concluído</option><option>Cancelado</option></select></article>)}</section></main>;
}