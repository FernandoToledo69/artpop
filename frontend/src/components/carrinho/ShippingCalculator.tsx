'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { calculateShipping, calculateShippingTotal, CartItem, clearShippingSelection, formatPostalCode, readShippingSelection, saveShippingSelection, ShippingOption } from '../../services/api/carrinho.service';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

interface ShippingCalculatorProps {
  subtotal: number;
  items: CartItem[];
  persistSelection?: boolean;
  compact?: boolean;
  onSelectionChange?: (option: ShippingOption | null) => void;
}

export default function ShippingCalculator({
  subtotal,
  items,
  persistSelection = true,
  compact = false,
  onSelectionChange,
}: ShippingCalculatorProps) {
  const [postalCode, setPostalCode] = useState('');
  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [selectedOption, setSelectedOption] = useState(() => readShippingSelection()?.id ?? 'PAC');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const packageKey = JSON.stringify(items.map(({ id, quantity, weightKg, lengthCm, widthCm, heightCm }) => (
    [id, quantity, weightKg, lengthCm, widthCm, heightCm]
  )));
  const previousPackageKey = useRef(packageKey);
  const quoteRequestId = useRef(0);

  useEffect(() => {
    if (previousPackageKey.current === packageKey) return;
    previousPackageKey.current = packageKey;
    quoteRequestId.current += 1;
    setOptions([]);
    setError('');
    setIsLoading(false);
    if (persistSelection) {
      clearShippingSelection();
      onSelectionChange?.(null);
    }
  }, [packageKey, persistSelection, onSelectionChange]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const requestId = quoteRequestId.current + 1;
    quoteRequestId.current = requestId;
    setError('');
    setOptions([]);
    setIsLoading(true);
    if (persistSelection) {
      clearShippingSelection();
      onSelectionChange?.(null);
    }

    try {
      const quote = await calculateShipping(postalCode, items);
      if (requestId !== quoteRequestId.current) return;
      if (quote.options.length === 0) throw new Error('Não há opções de entrega disponíveis para este CEP.');
      setOptions(quote.options);
      const option = quote.options.find((item) => item.id === selectedOption) ?? quote.options[0];
      setSelectedOption(option.id);
      if (persistSelection) {
        saveShippingSelection(option);
        onSelectionChange?.(option);
      }
    } catch (shippingError) {
      if (requestId !== quoteRequestId.current) return;
      setError(shippingError instanceof Error ? shippingError.message : 'Não foi possível calcular o frete.');
    } finally {
      if (requestId === quoteRequestId.current) setIsLoading(false);
    }
  }

  function handlePostalCodeChange(value: string) {
    quoteRequestId.current += 1;
    setIsLoading(false);
    setPostalCode(formatPostalCode(value));
    setOptions([]);
    if (persistSelection) {
      clearShippingSelection();
      onSelectionChange?.(null);
    }
  }

  function selectShippingOption(option: ShippingOption) {
    setSelectedOption(option.id);
    if (persistSelection) {
      saveShippingSelection(option);
      onSelectionChange?.(option);
    }
  }

  return (
    <section className={`shipping-calculator${compact ? ' shipping-calculator-compact cart-shipping' : ''}`} aria-labelledby="shipping-title">
      {!compact && <div className="shipping-heading">
        <div>
          <p className="eyebrow">ENTREGA</p>
          <h2 id="shipping-title">Calcule o frete</h2>
          <p>Veja as opções de entrega para o seu endereço antes de finalizar.</p>
        </div>
        <span className="shipping-icon" aria-hidden="true">↗</span>
      </div>}
      {compact && <h3 id="shipping-title">Calcular frete por CEP</h3>}
      <form className="shipping-form" onSubmit={handleSubmit}>
        <label className="field">{compact ? 'CEP de destino' : 'CEP'}<input inputMode="numeric" autoComplete="postal-code" value={postalCode} onChange={(event) => handlePostalCodeChange(event.target.value)} placeholder="00000-000" maxLength={9} aria-describedby={error ? 'shipping-error' : 'shipping-help'} /></label>
        <button type="submit" disabled={isLoading}>{isLoading ? 'Calculando...' : 'Calcular frete'}</button>
      </form>
      {error ? <p className="error" id="shipping-error" role="alert">{error}</p> : <p className="shipping-help" id="shipping-help">Digite os 8 números do seu CEP.</p>}
      {options.length > 0 && <div className="shipping-options" aria-live="polite"><p className="shipping-options-title">Escolha uma opção de entrega</p>{options.map((option) => <label className={`shipping-option${selectedOption === option.id ? ' selected' : ''}`} key={option.id}><input type="radio" name="shipping-method" value={option.id} checked={selectedOption === option.id} onChange={() => selectShippingOption(option)} /><span><strong>{option.name}</strong><small>{option.description} · {option.deliveryTime}</small></span><b>{formatCurrency(option.price)}</b></label>)}{!compact && <div className="shipping-total"><span>Total da compra com frete</span><strong>{formatCurrency(calculateShippingTotal(subtotal, options.find((option) => option.id === selectedOption) ?? options[0]))}</strong></div>}</div>}
    </section>
  );
}