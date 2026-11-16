'use client';

import { useEffect, useMemo, useState } from 'react';
import ShippingCalculator from '../../components/carrinho/ShippingCalculator';
import { CartItem, readCart, readShippingSelection, removeFromCart, ShippingOption, updateCartItemQuantity } from '../../services/api/carrinho.service';
import ProfileAvatar from '../../components/ui/ProfileAvatar';
import CartLink from '../../components/ui/CartLink';
import SiteHeader from '../../components/layout/SiteHeader';
import LoadingState from '../../components/feedback/LoadingState';
import ErrorState from '../../components/feedback/ErrorState';
import { applyCoupon, calculateDiscount, readAppliedCoupon, Coupon } from '../../services/api/cupons.service';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

export default function CarrinhoPage() {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState('');
	const [couponCode, setCouponCode] = useState('');
	const [coupon, setCoupon] = useState<Coupon | null>(null);
	const [couponMessage, setCouponMessage] = useState('');
	const [shipping, setShipping] = useState<ShippingOption | null>(null);

	useEffect(() => { try { setCartItems(readCart()); setCoupon(readAppliedCoupon()); setShipping(readShippingSelection()); } catch (error) { setLoadError(error instanceof Error ? error.message : 'Não foi possível carregar o carrinho.'); } finally { setIsLoading(false); } }, []);

	const artisanGroups = useMemo(() => {
		const groups = new Map<string, CartItem[]>();
		cartItems.forEach((item) => groups.set(item.artisanName, [...(groups.get(item.artisanName) ?? []), item]));
		return Array.from(groups.entries());
	}, [cartItems]);
	const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
	const discount = calculateDiscount(subtotal, coupon);
	const total = subtotal - discount + (shipping?.price ?? 0);

	function handleCoupon() {
		const applied = applyCoupon(couponCode);
		setCoupon(applied);
		setCouponMessage(applied ? `${applied.description} aplicado.` : 'Cupom inválido.');
	}

	function handleQuantityChange(productId: string, quantity: number) {
		setCartItems(updateCartItemQuantity(productId, quantity));
	}

	function handleRemove(productId: string) {
		setCartItems(removeFromCart(productId));
	}

	return (
		<main className="page-shell cart-page">
			<SiteHeader />
			<div className="breadcrumb"><a href="/">Início</a><span>/</span><strong>Carrinho</strong></div>
			<section className="cart-intro"><div><p className="eyebrow">SEU PEDIDO</p><h1 style={{ fontFamily: "'Museo', 'Museo Sans', 'DM Sans', sans-serif", fontWeight: 700 }}>Seu carrinho</h1></div><span className="cart-count">{cartItems.length} {cartItems.length === 1 ? 'obra' : 'obras'}</span></section>
			{isLoading ? <LoadingState message="Carregando seu carrinho..." /> : loadError ? <ErrorState message={loadError} /> : cartItems.length === 0 ? <section className="cart-empty"><h2>Seu carrinho está esperando uma história.</h2><p>Escolha uma obra autoral para começar sua compra.</p><a className="catalog-action" href="/">Explorar obras</a></section> : <>
				<div className="cart-layout">
					<section className="cart-items" aria-labelledby="cart-items-title"><div className="cart-section-heading"><h2 id="cart-items-title">Obras escolhidas</h2><span>{cartItems.length} itens</span></div><div className="cart-list">{artisanGroups.map(([artisanName, items]) => <section className="artisan-cart-group" key={artisanName}><h3>{artisanName}<span>{items[0].artisanCity}</span></h3>{items.map((item) => <article className="cart-item" key={item.id}><div className={`cart-item-image marketplace-image-${item.category}`}>{item.mainImage ? <img src={item.mainImage} alt={`Imagem da obra ${item.title}`} /> : <span>{item.category === 'ceramica' ? 'FORMA' : item.category === 'madeira' ? 'RAIZ' : 'TRAÇO'}</span>}</div><div className="cart-item-info"><p className="marketplace-category">Peça autoral</p><h4>{item.title}</h4><strong>{formatCurrency(item.price)}</strong></div><div className="cart-quantity"><label htmlFor={`quantity-${item.id}`}>Quantidade</label><input id={`quantity-${item.id}`} type="number" min="1" max={item.stock} value={item.quantity} onChange={(event) => handleQuantityChange(item.id, Number(event.target.value))} /><button type="button" onClick={() => handleRemove(item.id)}>Remover</button></div></article>)}</section>)}</div></section>
					<aside className="cart-summary"><h2>Resumo do pedido</h2><div><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div><div className="cart-coupon"><label htmlFor="coupon">Cupom de desconto</label><div><input id="coupon" type="text" placeholder="Insira seu cupom" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} /><button type="button" onClick={handleCoupon}>Aplicar</button></div>{couponMessage && <small className={coupon ? 'success-message' : 'error'}>{couponMessage}</small>}</div><ShippingCalculator subtotal={subtotal - discount} items={cartItems} compact onSelectionChange={setShipping} /><div><span>Frete</span><strong>{shipping ? formatCurrency(shipping.price) : <span className="summary-muted">Informe o CEP</span>}</strong></div>{coupon && <div><span>Desconto</span><strong>- {formatCurrency(discount)}</strong></div>}<div className="summary-total"><span>Total da compra</span><strong>{formatCurrency(total)}</strong></div><a className="checkout-action" href="/checkout">Continuar para pagamento</a></aside>
				</div>
			</>}
		</main>
	);
}
