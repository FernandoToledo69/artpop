'use client';

import { useEffect, useState } from 'react';
import SiteHeader from '../layout/SiteHeader';
import { readAdminSnapshot, updateOrderStatus } from '../../services/api/admin.service';
import { Order, OrderStatus } from '../../services/api/pedidos.service';
import { Product } from '../../types/produto';

export default function AdminDashboard() {
  const [data, setData] = useState(readAdminSnapshot());
  useEffect(() => setData(readAdminSnapshot()), []);
  function changeStatus(order: Order, status: OrderStatus) { setData({ ...data, orders: updateOrderStatus(order.id, status) }); }
  return <main className="page-shell"><SiteHeader /><section className="page-intro"><div className="intro-copy-block"><p className="eyebrow">ADMINISTRAÇÃO</p><h1>Visão geral<br /><span className="title-highlight">da artpop</span></h1><p className="intro-copy">Acompanhe o catálogo, os artesãos e os pedidos da plataforma.</p></div></section><section className="marketplace-grid"><article className="catalog-summary"><strong>{data.products.length}</strong><span> produtos</span></article><article className="catalog-summary"><strong>{data.artisans.length}</strong><span> artesãos</span></article><article className="catalog-summary"><strong>{data.orders.length}</strong><span> pedidos</span></article></section><section className="catalog-section"><div className="catalog-heading"><div><p className="eyebrow">MODERAÇÃO</p><h2>Produtos publicados</h2></div></div><div className="product-list">{data.products.map((product: Product) => <article className="product-row" key={product.id}><div className="product-info"><h3>{product.title}</h3><p>{product.artisanName ?? product.artisanCity} · estoque: {product.stock}</p></div><a className="edit-product-link" href={`/produtos/${product.id}`}>Ver anúncio</a></article>)}</div></section><section className="catalog-section"><div className="catalog-heading"><div><p className="eyebrow">OPERAÇÃO</p><h2>Pedidos recentes</h2></div></div>{data.orders.length === 0 ? <div className="catalog-empty"><p>Nenhum pedido registrado.</p></div> : data.orders.map((order) => <article className="product-row" key={order.id}><div className="product-info"><h3>{order.id}</h3><p>R$ {order.total.toFixed(2).replace('.', ',')} · {order.items.length} item(ns)</p></div><select value={order.status} onChange={(event) => changeStatus(order, event.target.value as OrderStatus)}><option>Pendente</option><option>Enviado</option><option>Concluído</option><option>Cancelado</option></select></article>)}</section></main>;
}