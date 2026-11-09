import type { AuthUser } from '../../types/auth';
import { Product } from '../../types/produto';
import { isProductOwner, readCatalogProducts } from './produtos.service';
import { getUserScopedStorageKey } from './user-storage';

const CART_STORAGE_KEY = 'origem:cart';
const SHIPPING_SELECTION_KEY = 'origem:shipping-selection';

export interface CartItem {
	id: string;
	title: string;
	artisanName: string;
	artisanId?: string;
	artisanCity: string;
	price: number;
	quantity: number;
	stock: number;
	category: Product['category'];
	mainImage: string;
}

export function getArtisanName(product: Product): string {
	return product.artisanName ?? `Ateliê ${product.artisanCity}`;
}

export function readCart(): CartItem[] {
	if (typeof window === 'undefined') return [];

	try {
		const savedItems = JSON.parse(localStorage.getItem(getUserScopedStorageKey(CART_STORAGE_KEY)) ?? '[]') as CartItem[];
		return savedItems.filter((item) => item.quantity > 0);
	} catch {
		return [];
	}
}

function saveCart(items: CartItem[]): CartItem[] {
	localStorage.setItem(getUserScopedStorageKey(CART_STORAGE_KEY), JSON.stringify(items));
	window.dispatchEvent(new Event('cart-updated'));
	return items;
}

export function clearCart(): void {
	localStorage.removeItem(getUserScopedStorageKey(CART_STORAGE_KEY));
	localStorage.removeItem(getUserScopedStorageKey(SHIPPING_SELECTION_KEY));
	window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(product: Product, currentUser: AuthUser | null, quantityToAdd: number = 1): CartItem[] {
	const items = readCart();
	const currentProduct = readCatalogProducts().find((item) => item.id === product.id);
	if (!currentProduct || isProductOwner(currentProduct, currentUser) || currentProduct.stock <= 0 || quantityToAdd <= 0) return items;
	const existingItem = items.find((item) => item.id === currentProduct.id);

	if (existingItem) {
		existingItem.quantity = Math.min(existingItem.quantity + quantityToAdd, currentProduct.stock);
		return saveCart([...items]);
	}

	return saveCart([...items, {
		id: currentProduct.id,
		title: currentProduct.title,
		artisanName: getArtisanName(currentProduct),
		artisanId: currentProduct.artisanId,
		artisanCity: currentProduct.artisanCity,
		price: currentProduct.price,
		quantity: Math.min(quantityToAdd, currentProduct.stock),
		stock: currentProduct.stock,
		category: currentProduct.category,
		mainImage: currentProduct.mainImage,
	}]);
}

export function updateCartItemQuantity(productId: string, quantity: number): CartItem[] {
	const items = readCart().map((item) => item.id === productId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item);
	return saveCart(items);
}

export function removeFromCart(productId: string): CartItem[] {
	return saveCart(readCart().filter((item) => item.id !== productId));
}

export type ShippingMethod = 'PAC' | 'SEDEX';

export interface ShippingOption {
	id: ShippingMethod;
	name: string;
	description: string;
	price: number;
	deliveryTime: string;
}

export interface ShippingQuote {
	postalCode: string;
	options: ShippingOption[];
}

export function formatPostalCode(value: string): string {
	const digits = value.replace(/\D/g, '').slice(0, 8);
	return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function saveShippingSelection(option: ShippingOption): void { localStorage.setItem(getUserScopedStorageKey(SHIPPING_SELECTION_KEY), JSON.stringify(option)); }
export function clearShippingSelection(): void { localStorage.removeItem(getUserScopedStorageKey(SHIPPING_SELECTION_KEY)); }
export function readShippingSelection(): ShippingOption | null {
	if (typeof window === 'undefined') return null;
	try { return JSON.parse(localStorage.getItem(getUserScopedStorageKey(SHIPPING_SELECTION_KEY)) ?? 'null') as ShippingOption | null; } catch { return null; }
}

export function calculateShippingTotal(subtotal: number, option: ShippingOption): number {
	return Math.round((subtotal + option.price + Number.EPSILON) * 100) / 100;
}

export async function calculateShipping(postalCode: string): Promise<ShippingQuote> {
	const normalizedPostalCode = postalCode.replace(/\D/g, '');

	if (normalizedPostalCode.length !== 8 || /^(\d)\1{7}$/.test(normalizedPostalCode)) {
		throw new Error('Informe um CEP válido com 8 números.');
	}

	await new Promise((resolve) => setTimeout(resolve, 350));

	const regionalFactor = Number(normalizedPostalCode.slice(0, 2)) % 5;
	const pacPrice = Math.round((18.9 + regionalFactor * 2.45 + Number.EPSILON) * 100) / 100;
	const sedexPrice = Math.round((pacPrice + 14.5 + Number.EPSILON) * 100) / 100;

	return {
		postalCode: normalizedPostalCode,
		options: [
			{ id: 'PAC', name: 'PAC', description: 'Entrega econômica', price: pacPrice, deliveryTime: '8 a 12 dias úteis' },
			{ id: 'SEDEX', name: 'Sedex', description: 'Entrega expressa', price: sedexPrice, deliveryTime: '3 a 5 dias úteis' },
		],
	};
}
