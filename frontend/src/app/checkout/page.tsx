import type { Metadata } from 'next';
import CheckoutGate from '../../components/checkout/CheckoutGate';

export const metadata: Metadata = { title: 'Checkout' };

export default function CheckoutPage() {
  return <CheckoutGate />;
}
