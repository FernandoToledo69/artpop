'use client';

import { useEffect, useState } from 'react';
import { readCart } from '../../services/api/carrinho.service';

export default function CartLink() {
	const [itemCount, setItemCount] = useState(0);

	useEffect(() => {
		const updateCount = () => setItemCount(readCart().reduce((total, item) => total + item.quantity, 0));
		updateCount();
		window.addEventListener('cart-updated', updateCount);
		window.addEventListener('storage', updateCount);
		return () => {
			window.removeEventListener('cart-updated', updateCount);
			window.removeEventListener('storage', updateCount);
		};
	}, []);

	return <a className="cart-link" href="/carrinho" aria-label={`Abrir carrinho${itemCount ? ` com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}` : ''}`}><span aria-hidden="true">🛒</span><span>Carrinho</span>{itemCount > 0 && <b>{itemCount}</b>}</a>;
}