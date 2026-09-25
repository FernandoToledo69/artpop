export interface Coupon {
  code: string;
  description: string;
  discountPercent: number;
}

const COUPONS: Coupon[] = [
  { code: 'ARTPOP10', description: '10% de desconto', discountPercent: 10 },
  { code: 'BEMVINDO15', description: '15% de desconto', discountPercent: 15 },
  { code: 'FEITOAMANO20', description: '20% de desconto', discountPercent: 20 },
  { code: 'FRETEGRATIS', description: '5% de desconto', discountPercent: 5 },
  { code: 'CULTURA25', description: '25% de desconto', discountPercent: 25 },
];

const COUPON_STORAGE_KEY = 'origem:coupon';

export function listCoupons(): Coupon[] { return COUPONS; }
export function applyCoupon(code: string): Coupon | null {
  const coupon = COUPONS.find((item) => item.code === code.trim().toUpperCase()) ?? null;
  if (coupon) localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
  return coupon;
}
export function readAppliedCoupon(): Coupon | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(COUPON_STORAGE_KEY) ?? 'null') as Coupon | null; } catch { return null; }
}
export function clearAppliedCoupon(): void { localStorage.removeItem(COUPON_STORAGE_KEY); }
export function calculateDiscount(subtotal: number, coupon: Coupon | null): number { return coupon ? Number((subtotal * coupon.discountPercent / 100).toFixed(2)) : 0; }
