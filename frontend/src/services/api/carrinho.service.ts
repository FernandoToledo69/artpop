import { Product } from '../../types/produto';

const CART_STORAGE_KEY = 'origem:cart';

export interface CartItem {
	id: string;
	title: string;
	artisanName: string;
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
		const savedItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]') as CartItem[];
		return savedItems.filter((item) => item.quantity > 0);
	} catch {
		return [];
	}
}

function saveCart(items: CartItem[]): CartItem[] {
	localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
	window.dispatchEvent(new Event('cart-updated'));
	return items;
}

export function addToCart(product: Product, quantityToAdd: number = 1): CartItem[] {
	const items = readCart();
	const existingItem = items.find((item) => item.id === product.id);

	if (existingItem) {
		existingItem.quantity = Math.min(existingItem.quantity + quantityToAdd, product.stock);
		return saveCart([...items]);
	}

	return saveCart([...items, {
		id: product.id,
		title: product.title,
		artisanName: getArtisanName(product),
		artisanCity: product.artisanCity,
		price: product.price,
		quantity: Math.min(quantityToAdd, product.stock),
		stock: product.stock,
		category: product.category,
		mainImage: product.mainImage,
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

const SHIPPING_SELECTION_KEY = 'origem:shipping-selection';

export function saveShippingSelection(option: ShippingOption): void { localStorage.setItem(SHIPPING_SELECTION_KEY, JSON.stringify(option)); }
export function readShippingSelection(): ShippingOption | null {
	if (typeof window === 'undefined') return null;
	try { return JSON.parse(localStorage.getItem(SHIPPING_SELECTION_KEY) ?? 'null') as ShippingOption | null; } catch { return null; }
}

export async function calculateShipping(postalCode: string): Promise<ShippingQuote> {
	const normalizedPostalCode = postalCode.replace(/\D/g, '');

	if (normalizedPostalCode.length !== 8) {
		throw new Error('Informe um CEP válido com 8 números.');
	}

	await new Promise((resolve) => setTimeout(resolve, 350));

	const regionalFactor = Number(normalizedPostalCode.slice(0, 2)) % 5;
	const pacPrice = 18.9 + regionalFactor * 2.45;
	const sedexPrice = pacPrice + 14.5;

	return {
		postalCode: normalizedPostalCode,
		options: [
			{ id: 'PAC', name: 'PAC', description: 'Entrega econômica', price: pacPrice, deliveryTime: '8 a 12 dias úteis' },
			{ id: 'SEDEX', name: 'Sedex', description: 'Entrega expressa', price: sedexPrice, deliveryTime: '3 a 5 dias úteis' },
		],
	};
}
