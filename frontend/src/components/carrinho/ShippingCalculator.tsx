'use client';

import { FormEvent, useState } from 'react';
import { calculateShipping, saveShippingSelection, ShippingOption } from '../../services/api/carrinho.service';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

interface ShippingCalculatorProps {
  subtotal: number;
}

export default function ShippingCalculator({ subtotal }: ShippingCalculatorProps) {
  const [postalCode, setPostalCode] = useState('');
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedOption, setSelectedOption] = useState('PAC');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setOptions([]);
    setIsLoading(true);

    try {
      const quote = await calculateShipping(postalCode);
      setOptions(quote.options);
      setSelectedOption(quote.options[0].id);
      saveShippingSelection(quote.options[0]);
    } catch (shippingError) {
      setError(shippingError instanceof Error ? shippingError.message : 'Não foi possível calcular o frete.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="shipping-calculator" aria-labelledby="shipping-title">
      <div className="shipping-heading">
        <div>
          <p className="eyebrow">ENTREGA</p>
          <h2 id="shipping-title">Calcule o frete</h2>
          <p>Veja as opções de entrega para o seu endereço antes de finalizar.</p>
        </div>
        <span className="shipping-icon" aria-hidden="true">↗</span>
      </div>
      <form className="shipping-form" onSubmit={handleSubmit}>
        <label className="field">CEP<input inputMode="numeric" autoComplete="postal-code" value={postalCode} onChange={(event) => setPostalCode(event.target.value)} placeholder="00000-000" maxLength={9} aria-describedby={error ? 'shipping-error' : 'shipping-help'} /></label>
        <button type="submit" disabled={isLoading}>{isLoading ? 'Calculando...' : 'Calcular frete'}</button>
      </form>
      {error ? <p className="error" id="shipping-error" role="alert">{error}</p> : <p className="shipping-help" id="shipping-help">Digite os 8 números do seu CEP.</p>}
      {options.length > 0 && <div className="shipping-options" aria-live="polite"><p className="shipping-options-title">Escolha uma opção de entrega</p>{options.map((option) => <label className={`shipping-option${selectedOption === option.id ? ' selected' : ''}`} key={option.id}><input type="radio" name="shipping-method" value={option.id} checked={selectedOption === option.id} onChange={() => setSelectedOption(option.id)} /><span><strong>{option.name}</strong><small>{option.description} · {option.deliveryTime}</small></span><b>{formatCurrency(option.price)}</b></label>)}<div className="shipping-total"><span>Total com frete</span><strong>{formatCurrency(subtotal + (options.find((option) => option.id === selectedOption)?.price ?? 0))}</strong></div></div>}
    </section>
  );
}