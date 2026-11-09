import { CartItem, readCart, readShippingSelection } from './carrinho.service';
import { isProductOwner, readCatalogProducts, updateProductStock } from './produtos.service';
import { getCurrentUser } from './auth.service';
import { readAppliedCoupon, calculateDiscount } from './cupons.service';
import { getUserScopedStorageKey, readAllUserScopedStorageEntries } from './user-storage';

export type OrderStatus = 'Pendente' | 'Enviado' | 'Concluído' | 'Cancelado';

export interface Order {
	id: string;
	createdAt: string;
	items: CartItem[];
	total: number;
	discount?: number;
	shipping?: { name: string; price: number; deliveryTime: string };
	status: OrderStatus;
	payment: Pick<PaymentProfile, 'brand' | 'last4'>;
}

const ORDERS_STORAGE_KEY = 'origem:orders';
export interface PaymentProfile {
	token: string;
	brand: 'Visa' | 'Mastercard' | 'Elo' | 'Cartão' | 'Pix';
	last4: string;
	updatedAt: string;
}

export interface PaymentDetails {
	cardholderName: string;
	cardNumber: string;
	expiryDate: string;
	securityCode: string;
}

const PAYMENT_PROFILE_KEY = 'origem:payment-profile';

export function formatCardExpiry(value: string): string {
	const digits = value.replace(/\D/g, '').slice(0, 4);
	return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export function readOrders(): Order[] {
	if (typeof window === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(getUserScopedStorageKey(ORDERS_STORAGE_KEY)) ?? '[]') as Order[];
	} catch {
		return [];
	}
}

export function readAllOrders(): Order[] {
	return readAllUserScopedStorageEntries<Order[]>(ORDERS_STORAGE_KEY).flatMap(({ value }) => Array.isArray(value) ? value : []);
}

export function updateOrderStatus(orderId: string, status: OrderStatus): Order[] {
	if (typeof window === 'undefined') return [];
	const prefix = `${ORDERS_STORAGE_KEY}:`;
	for (let index = 0; index < localStorage.length; index += 1) {
		const key = localStorage.key(index);
		if (!key?.startsWith(prefix)) continue;
		try {
			const orders = JSON.parse(localStorage.getItem(key) ?? '[]') as Order[];
			const updatedOrders = orders.map((order) => order.id === orderId ? { ...order, status } : order);
			if (updatedOrders.some((order, orderIndex) => order !== orders[orderIndex])) {
				localStorage.setItem(key, JSON.stringify(updatedOrders));
			}
		} catch {
			continue;
		}
	}
	return readOrders();
}

export function updateArtisanOrderStatus(orderId: string, status: OrderStatus, artisanId: string): Order[] {
	if (typeof window === 'undefined') return [];
	const prefix = `${ORDERS_STORAGE_KEY}:`;
	for (let index = 0; index < localStorage.length; index += 1) {
		const key = localStorage.key(index);
		if (!key?.startsWith(prefix)) continue;
		try {
			const orders = JSON.parse(localStorage.getItem(key) ?? '[]') as Order[];
			const updatedOrders = orders.map((order) => order.id === orderId
				&& order.items.some((item) => item.artisanId === artisanId)
				? { ...order, status }
				: order);
			if (updatedOrders.some((order, orderIndex) => order !== orders[orderIndex])) {
				localStorage.setItem(key, JSON.stringify(updatedOrders));
			}
		} catch {
			continue;
		}
	}
	return readOrders();
}

export function createOrder(payment: PaymentProfile): Order | null {
	const currentUser = getCurrentUser();
	if (!currentUser) return null;
	const items = readCart();
	if (items.length === 0) return null;
	const availableProducts = readCatalogProducts();
	if (items.some((item) => {
		const product = availableProducts.find((availableProduct) => availableProduct.id === item.id);
		return !product || isProductOwner(product, currentUser) || product.stock < item.quantity;
	})) return null;
	const shipping = readShippingSelection();
	const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
	const discount = calculateDiscount(subtotal, readAppliedCoupon());
	const order: Order = { id: `PED-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString(), items, total: subtotal - discount + (shipping?.price ?? 0), discount, shipping: shipping ? { name: shipping.name, price: shipping.price, deliveryTime: shipping.deliveryTime } : undefined, status: 'Pendente', payment: { brand: payment.brand, last4: payment.last4 } };
	items.forEach((item) => updateProductStock(item.id, Math.max(0, item.stock - item.quantity)));
	localStorage.setItem(getUserScopedStorageKey(ORDERS_STORAGE_KEY), JSON.stringify([order, ...readOrders()]));
	localStorage.setItem(getUserScopedStorageKey('origem:cart'), '[]');
	window.dispatchEvent(new Event('cart-updated'));
	return order;
}

export function cancelOrder(orderId: string): Order[] {
	const orders = readOrders().map((order) => order.id === orderId ? { ...order, status: 'Cancelado' as const } : order);
	localStorage.setItem(getUserScopedStorageKey(ORDERS_STORAGE_KEY), JSON.stringify(orders));
	return orders;
}

function detectBrand(cardNumber: string): PaymentProfile['brand'] {
	if (/^4/.test(cardNumber)) return 'Visa';
	if (/^5[1-5]/.test(cardNumber)) return 'Mastercard';
	if (/^(4011|4312|4389)/.test(cardNumber)) return 'Elo';
	return 'Cartão';
}

function passesLuhnCheck(cardNumber: string): boolean {
	let sum = 0;
	let shouldDouble = false;
	for (let index = cardNumber.length - 1; index >= 0; index -= 1) {
		let digit = Number(cardNumber[index]);
		if (shouldDouble) digit *= 2;
		if (digit > 9) digit -= 9;
		sum += digit;
		shouldDouble = !shouldDouble;
	}
	return sum % 10 === 0;
}

export async function tokenizeCard(details: PaymentDetails): Promise<PaymentProfile> {
	const cardNumber = details.cardNumber.replace(/\D/g, '');
	if (details.cardholderName.trim().length < 3) throw new Error('Informe o nome impresso no cartão.');
	if (cardNumber.length < 13 || cardNumber.length > 19 || !passesLuhnCheck(cardNumber)) throw new Error('Confira o número do cartão.');
	if (!/^\d{2}\/\d{2}$/.test(details.expiryDate)) throw new Error('Informe a validade no formato MM/AA.');
	if (!/^\d{3,4}$/.test(details.securityCode)) throw new Error('Confira o código de segurança.');

	await new Promise((resolve) => setTimeout(resolve, 450));
	return {
		token: `tok_${crypto.randomUUID()}`,
		brand: detectBrand(cardNumber),
		last4: cardNumber.slice(-4),
		updatedAt: new Date().toISOString(),
	};
}

export function readPaymentProfile(): PaymentProfile | null {
	if (typeof window === 'undefined') return null;
	try {
		return JSON.parse(localStorage.getItem(getUserScopedStorageKey(PAYMENT_PROFILE_KEY)) ?? 'null') as PaymentProfile | null;
	} catch {
		return null;
	}
}

export function savePaymentProfile(profile: PaymentProfile): PaymentProfile {
	localStorage.setItem(getUserScopedStorageKey(PAYMENT_PROFILE_KEY), JSON.stringify(profile));
	return profile;
}

export function deletePaymentProfile(): void {
	localStorage.removeItem(getUserScopedStorageKey(PAYMENT_PROFILE_KEY));
}
