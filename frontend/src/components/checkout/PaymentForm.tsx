'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrder, deletePaymentProfile, formatCardExpiry, PaymentDetails, PaymentProfile, readPaymentProfile, savePaymentProfile, tokenizeCard } from '../../services/api/pedidos.service';
import { getCurrentUser } from '../../services/api/auth.service';

const emptyDetails: PaymentDetails = { cardholderName: '', cardNumber: '', expiryDate: '', securityCode: '' };
type PaymentMethod = 'pix' | 'credit' | 'debit';

export default function PaymentForm() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');
  const [details, setDetails] = useState(emptyDetails);
  const [savedCard, setSavedCard] = useState<PaymentProfile | null>(null);
  const [useSavedCard, setUseSavedCard] = useState(false);
  const [saveCardForFuture, setSaveCardForFuture] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [pixQrCode, setPixQrCode] = useState('');

  useEffect(() => {
    const profile = readPaymentProfile();
    setSavedCard(profile);
    setUseSavedCard(Boolean(profile));
    const payload = `artpop|pagamentos@artpop.local|pedido-${Date.now()}`;
    setPixQrCode(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payload)}`);
  }, []);

  function updateField(field: keyof PaymentDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
    setError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsProcessing(true);
    setError('');
    try {
      const paymentProfile = await tokenizeCard(details);
      if (!finishPurchase(paymentProfile)) return;
      if (saveCardForFuture) {
        try {
          savePaymentProfile(paymentProfile);
          setSavedCard(paymentProfile);
          setUseSavedCard(true);
        } catch {
          setError('Compra concluída, mas não foi possível salvar o cartão para compras futuras.');
        }
      }
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : 'Não foi possível processar o cartão.');
    } finally {
      setIsProcessing(false);
    }
  }

  function finishPurchase(payment: PaymentProfile): boolean {
    if (!getCurrentUser()) {
      router.push('/login');
      return false;
    }
    if (createOrder(payment)) setOrderCreated(true);
    else {
      setError('O estoque de uma ou mais obras foi atualizado. Revise seu carrinho antes de continuar.');
      return false;
    }
    return true;
  }

  function handleFinishPurchase() {
    const payment: PaymentProfile = isCardMethod && savedCard && useSavedCard
      ? savedCard
      : { token: `tok_${paymentMethod}_${Date.now()}`, brand: paymentMethod === 'pix' ? 'Pix' : 'Cartão', last4: paymentMethod === 'pix' ? 'PIX' : '0000', updatedAt: new Date().toISOString() };
    finishPurchase(payment);
  }

  function removeSavedCard() {
    deletePaymentProfile();
    setSavedCard(null);
    setUseSavedCard(false);
  }

  const pixKey = 'pagamentos@artpop.local';
  const isCardMethod = paymentMethod === 'credit' || paymentMethod === 'debit';
  const paymentOptions: [PaymentMethod, string][] = [['pix', 'Pix'], ['credit', 'Cartão de crédito'], ['debit', 'Cartão de débito']];

  return (
    <section className="payment-form-section" aria-labelledby="payment-form-title">
      <div className="section-heading"><span className="section-number">02</span><div><h2 id="payment-form-title">Forma de pagamento</h2><p>Escolha como deseja concluir sua compra.</p></div></div>
      <div className="payment-methods" role="radiogroup" aria-label="Forma de pagamento">{paymentOptions.map(([value, label]) => <label className={paymentMethod === value ? 'selected' : ''} key={value}><input type="radio" name="payment-method" checked={paymentMethod === value} onChange={() => { setPaymentMethod(value); setError(''); }} />{label}</label>)}</div>
      {paymentMethod === 'pix' && <div className="pix-payment"><div><h3>Pagamento via Pix</h3><p>Escaneie o QR code ou copie a chave para simular o pagamento.</p><strong>{pixKey}</strong><button type="button" className="copy-pix" onClick={() => navigator.clipboard?.writeText(pixKey)}>Copiar chave</button></div>{pixQrCode ? <img src={pixQrCode} alt="QR code para pagamento via Pix" width="180" height="180" /> : <div className="pix-qr-placeholder" aria-label="Gerando QR code">Gerando QR code...</div>}</div>}
      {isCardMethod && !orderCreated && <>{savedCard && <div className="saved-payment"><span className="saved-payment-icon">{savedCard.brand[0]}</span><div><strong>{savedCard.brand} terminado em {savedCard.last4}</strong><small>Cartão salvo no seu perfil</small></div>{useSavedCard ? <button type="button" onClick={() => { setUseSavedCard(false); setSaveCardForFuture(false); setDetails(emptyDetails); setError(''); }}>Usar outro cartão</button> : <button type="button" onClick={() => { setUseSavedCard(true); setSaveCardForFuture(false); setError(''); }}>Usar cartão salvo</button>}<button type="button" className="delete-saved-card" onClick={removeSavedCard}>Excluir cartão</button></div>}{!useSavedCard && <form className="payment-fields" onSubmit={handleSubmit} noValidate><label className="field field-wide">Nome no cartão<input autoComplete="cc-name" value={details.cardholderName} onChange={(event) => updateField('cardholderName', event.target.value)} placeholder="Como aparece no cartão" /></label><label className="field field-wide">Número do cartão<input inputMode="numeric" autoComplete="cc-number" value={details.cardNumber} onChange={(event) => updateField('cardNumber', event.target.value)} placeholder="0000 0000 0000 0000" maxLength={19} /></label><label className="field">Validade<input inputMode="numeric" autoComplete="cc-exp" value={details.expiryDate} onChange={(event) => updateField('expiryDate', formatCardExpiry(event.target.value))} placeholder="MM/AA" maxLength={5} /></label><label className="field">Código de segurança<input inputMode="numeric" autoComplete="cc-csc" type="password" value={details.securityCode} onChange={(event) => updateField('securityCode', event.target.value)} placeholder="CVV" maxLength={4} /></label><label className="save-payment-option"><input type="checkbox" checked={saveCardForFuture} onChange={(event) => setSaveCardForFuture(event.target.checked)} />Salvar cartão com segurança para compras futuras</label><div className="payment-actions"><button className="finish-purchase-button" type="submit" disabled={isProcessing}>{isProcessing ? 'Processando...' : 'Finalizar compra'}</button></div></form>}{useSavedCard && <div className="payment-actions"><button className="finish-purchase-button" type="button" onClick={handleFinishPurchase}>Finalizar compra</button></div>}</>}
      {paymentMethod === 'pix' && !orderCreated && <button className="finish-purchase-button" type="button" onClick={handleFinishPurchase}>Finalizar compra</button>}
      {orderCreated && <p className="success-message" role="status">Pedido realizado com sucesso. <a href="/pedidos">Ver meus pedidos</a></p>}
      {error && <p className="error" role="alert">{error}</p>}
      <p className="payment-security-note">Por segurança, não armazenamos o número completo nem o código de segurança.</p>
    </section>
  );
}
