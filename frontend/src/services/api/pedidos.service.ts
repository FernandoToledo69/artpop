import { CartItem, readCart } from './carrinho.service';

export type OrderStatus = 'Pendente' | 'Enviado' | 'Concluído' | 'Cancelado';

export interface Order {
	id: string;
	createdAt: string;
	items: CartItem[];
	total: number;
	status: OrderStatus;
	payment: Pick<PaymentProfile, 'brand' | 'last4'>;
}

const ORDERS_STORAGE_KEY = 'origem:orders';
export interface PaymentProfile {
	token: string;
	brand: 'Visa' | 'Mastercard' | 'Elo' | 'Cartão';
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

export function readOrders(): Order[] {
	if (typeof window === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) ?? '[]') as Order[];
	} catch {
		return [];
	}
}

export function createOrder(payment: PaymentProfile): Order | null {
	const items = readCart();
	if (items.length === 0) return null;
	const order: Order = { id: `PED-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString(), items, total: items.reduce((total, item) => total + item.price * item.quantity, 0), status: 'Pendente', payment: { brand: payment.brand, last4: payment.last4 } };
	localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([order, ...readOrders()]));
	localStorage.setItem('origem:cart', '[]');
	window.dispatchEvent(new Event('cart-updated'));
	return order;
}

export function cancelOrder(orderId: string): Order[] {
	const orders = readOrders().map((order) => order.id === orderId ? { ...order, status: 'Cancelado' as const } : order);
	localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
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
		return JSON.parse(localStorage.getItem(PAYMENT_PROFILE_KEY) ?? 'null') as PaymentProfile | null;
	} catch {
		return null;
	}
}

export function savePaymentProfile(profile: PaymentProfile): PaymentProfile {
	localStorage.setItem(PAYMENT_PROFILE_KEY, JSON.stringify(profile));
	return profile;
}
