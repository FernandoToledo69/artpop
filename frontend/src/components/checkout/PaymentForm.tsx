'use client';

import { FormEvent, useEffect, useState } from 'react';
import { createOrder, PaymentDetails, readPaymentProfile, savePaymentProfile, tokenizeCard } from '../../services/api/pedidos.service';

const emptyDetails: PaymentDetails = { cardholderName: '', cardNumber: '', expiryDate: '', securityCode: '' };

export default function PaymentForm() {
	const [details, setDetails] = useState(emptyDetails);
	const [savedCard, setSavedCard] = useState(readPaymentProfile());
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);
	const [orderCreated, setOrderCreated] = useState(false);

	useEffect(() => { setSavedCard(readPaymentProfile()); }, []);

	function updateField(field: keyof PaymentDetails, value: string) {
		setDetails((current) => ({ ...current, [field]: value }));
		setError('');
		setSuccess('');
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsProcessing(true);
		setError('');
		try {
			const paymentProfile = await tokenizeCard(details);
			savePaymentProfile(paymentProfile);
			setSavedCard(paymentProfile);
			setDetails(emptyDetails);
			setSuccess('Cartão tokenizado e vinculado ao seu perfil com segurança.');
		} catch (paymentError) {
			setError(paymentError instanceof Error ? paymentError.message : 'Não foi possível processar o cartão.');
		} finally {
			setIsProcessing(false);
		}
	}

	function handleFinishPurchase() {
		if (savedCard && createOrder(savedCard)) setOrderCreated(true);
	}

	return <section className="payment-form-section" aria-labelledby="payment-form-title"><div className="section-heading"><span className="section-number">02</span><div><h2 id="payment-form-title">Dados do cartão</h2><p>O gateway recebe os dados e devolve apenas um token seguro.</p></div></div>{savedCard && <div className="saved-payment"><span className="saved-payment-icon">{savedCard.brand[0]}</span><div><strong>{savedCard.brand} terminado em {savedCard.last4}</strong><small>Cartão salvo no seu perfil</small></div><button type="button" onClick={() => setSavedCard(null)}>Trocar cartão</button></div>}{!savedCard && <form className="payment-fields" onSubmit={handleSubmit} noValidate><label className="field field-wide">Nome no cartão<input autoComplete="cc-name" value={details.cardholderName} onChange={(event) => updateField('cardholderName', event.target.value)} placeholder="Como aparece no cartão" /></label><label className="field field-wide">Número do cartão<input inputMode="numeric" autoComplete="cc-number" value={details.cardNumber} onChange={(event) => updateField('cardNumber', event.target.value)} placeholder="0000 0000 0000 0000" maxLength={19} /></label><label className="field">Validade<input inputMode="numeric" autoComplete="cc-exp" value={details.expiryDate} onChange={(event) => updateField('expiryDate', event.target.value)} placeholder="MM/AA" maxLength={5} /></label><label className="field">Código de segurança<input inputMode="numeric" autoComplete="cc-csc" type="password" value={details.securityCode} onChange={(event) => updateField('securityCode', event.target.value)} placeholder="CVV" maxLength={4} /></label><button type="submit" disabled={isProcessing}>{isProcessing ? 'Processando...' : 'Salvar cartão com segurança'}</button></form>}{savedCard && !orderCreated && <button className="finish-purchase-button" type="button" onClick={handleFinishPurchase}>Finalizar compra</button>}{orderCreated && <p className="success-message" role="status">Pedido realizado com sucesso. <a href="/pedidos">Ver meus pedidos</a></p>}{error && <p className="error" role="alert">{error}</p>}{success && <p className="success-message" role="status">{success}</p>}<p className="payment-security-note">Por segurança, não armazenamos o número completo nem o código de segurança.</p></section>;
}