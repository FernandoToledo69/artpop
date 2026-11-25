import { Product } from '../../types/produto';
import { readProducts } from './produtos.service';
import { Order, readAllOrders, updateOrderStatus as updateStoredOrderStatus } from './pedidos.service';
import { readArtisans } from './artesoes.service';
import { demoProducts } from '../../mocks/products';
import { apiFetch, isApiConfigured } from './client';

export interface AdminSnapshot { products: Product[]; orders: Order[]; artisans: ReturnType<typeof readArtisans>; }
export interface PendingArtisan {
  id: string;
  name: string;
  city: string;
  state: string;
  phone: string;
  bio: string;
  avatarImage: string;
  createdAt: string;
  user: { name: string; email: string };
}
export type ArtisanModerationStatus = 'ACTIVE' | 'REJECTED';

export function readAdminSnapshot(): AdminSnapshot {
  return { products: [...demoProducts, ...readProducts().filter((product) => !demoProducts.some((demo) => demo.id === product.id))], orders: readAllOrders(), artisans: readArtisans() };
}

export function updateOrderStatus(orderId: string, status: Order['status']): Order[] {
  updateStoredOrderStatus(orderId, status);
  return readAllOrders();
}

export async function fetchPendingArtisans(): Promise<PendingArtisan[]> {
  if (!isApiConfigured()) throw new Error('Configure NEXT_PUBLIC_API_URL para acessar a fila de curadoria.');
  return apiFetch<PendingArtisan[]>('/api/admin/artesaos/pendentes');
}

export async function moderateArtisan(
  artisanId: string,
  status: ArtisanModerationStatus,
  reason?: string,
): Promise<void> {
  if (!isApiConfigured()) throw new Error('Configure NEXT_PUBLIC_API_URL para moderar cadastros.');
  await apiFetch(`/api/admin/artesaos/${encodeURIComponent(artisanId)}/moderacao`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...(reason ? { reason } : {}) }),
  });
}