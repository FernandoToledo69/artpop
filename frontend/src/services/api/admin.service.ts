import { Product } from '../../types/produto';
import { readProducts } from './produtos.service';
import { Order, readAllOrders, updateOrderStatus as updateStoredOrderStatus } from './pedidos.service';
import { readArtisans } from './artesoes.service';
import { demoProducts } from '../../mocks/products';

export interface AdminSnapshot { products: Product[]; orders: Order[]; artisans: ReturnType<typeof readArtisans>; }

export function readAdminSnapshot(): AdminSnapshot {
  return { products: [...demoProducts, ...readProducts().filter((product) => !demoProducts.some((demo) => demo.id === product.id))], orders: readAllOrders(), artisans: readArtisans() };
}

export function updateOrderStatus(orderId: string, status: Order['status']): Order[] {
  updateStoredOrderStatus(orderId, status);
  return readAllOrders();
}