import { Product } from '../../types/produto';
import { readProducts } from './produtos.service';
import { Order, readOrders } from './pedidos.service';
import { readArtisans } from './artesoes.service';
import { demoProducts } from '../../mocks/products';

export interface AdminSnapshot { products: Product[]; orders: Order[]; artisans: ReturnType<typeof readArtisans>; }

export function readAdminSnapshot(): AdminSnapshot {
  return { products: [...demoProducts, ...readProducts().filter((product) => !demoProducts.some((demo) => demo.id === product.id))], orders: readOrders(), artisans: readArtisans() };
}

export function updateOrderStatus(orderId: string, status: Order['status']): Order[] {
  const orders = readOrders().map((order) => order.id === orderId ? { ...order, status } : order);
  localStorage.setItem('origem:orders', JSON.stringify(orders));
  return orders;
}