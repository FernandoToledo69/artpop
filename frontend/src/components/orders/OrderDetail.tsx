'use client';

import { useEffect, useState } from 'react';
import SiteHeader from '../layout/SiteHeader';
import { Order, readOrders } from '../../services/api/pedidos.service';

export default function OrderDetail({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => setOrder(readOrders().find((item) => item.id === orderId) ?? null), [orderId]);
  if (!order) return <main className="page-shell"><SiteHeader /><section className="catalog-empty"><h1>Pedido não encontrado</h1><a className="catalog-action" href="/pedidos">Voltar aos pedidos</a></section></main>;
  return <main className="page-shell"><SiteHeader /><div className="breadcrumb"><a href="/pedidos">Meus pedidos</a><span>/</span><strong>{order.id}</strong></div><section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">DETALHES DA COMPRA</p><h1>{order.id}</h1><p className="intro-copy">Status: {order.status}</p></div></section><section className="catalog-section"><div className="product-list">{order.items.map((item) => <article className="product-row" key={item.id}><div className="product-image">{item.mainImage ? <img src={item.mainImage} alt="" /> : <span>artpop</span>}</div><div className="product-info"><h3>{item.title}</h3><p>{item.quantity} unidade(s) · R$ {item.price.toFixed(2).replace('.', ',')}</p></div></article>)}</div><div className="cart-summary"><div><span>Frete</span><strong>R$ {(order.shipping?.price ?? 0).toFixed(2).replace('.', ',')}</strong></div><div><span>Total</span><strong>R$ {order.total.toFixed(2).replace('.', ',')}</strong></div></div></section></main>;
}