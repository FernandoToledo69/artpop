 'use client';

import { FormEvent, useState } from 'react';
import { register } from '../../services/api/auth.service';

export default function RegisterForm() {
	const [fields, setFields] = useState({ name: '', email: '', phone: '', cpf: '', password: '', role: 'buyer' as 'buyer' | 'artisan', privacyConsent: false });
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(''); setIsSubmitting(true);
		if (!fields.privacyConsent) { setError('É necessário aceitar o uso dos dados para criar a conta.'); setIsSubmitting(false); return; }
		try { await register(fields.name, fields.email, fields.password, fields.phone, fields.cpf, fields.role); window.location.href = fields.role === 'artisan' ? '/painel-artesao' : '/'; } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível criar a conta.'); } finally { setIsSubmitting(false); }
	}
	return <form className="payment-fields" onSubmit={handleSubmit}><label className="field field-wide">Nome<input autoComplete="name" value={fields.name} onChange={(event) => setFields({ ...fields, name: event.target.value })} required /></label><label className="field">Telefone<input type="tel" autoComplete="tel" inputMode="tel" placeholder="(00) 00000-0000" value={fields.phone} onChange={(event) => setFields({ ...fields, phone: event.target.value })} required /></label><label className="field">CPF<input autoComplete="off" inputMode="numeric" placeholder="000.000.000-00" maxLength={14} value={fields.cpf} onChange={(event) => setFields({ ...fields, cpf: event.target.value })} required /></label><label className="field field-wide">E-mail<input type="email" autoComplete="email" value={fields.email} onChange={(event) => setFields({ ...fields, email: event.target.value })} required /></label><label className="field field-wide">Senha<input type="password" autoComplete="new-password" minLength={8} value={fields.password} onChange={(event) => setFields({ ...fields, password: event.target.value })} required /></label><fieldset className="account-type-field"><legend>Tipo de conta</legend><div className="account-type-options"><label className={fields.role === 'buyer' ? 'selected' : ''}><input type="radio" name="role" value="buyer" checked={fields.role === 'buyer'} onChange={() => setFields({ ...fields, role: 'buyer' })} /><span>Comprador</span><small>Para comprar e acompanhar pedidos</small></label><label className={fields.role === 'artisan' ? 'selected' : ''}><input type="radio" name="role" value="artisan" checked={fields.role === 'artisan'} onChange={() => setFields({ ...fields, role: 'artisan' })} /><span>Artesão</span><small>Para publicar obras e gerenciar estoque</small></label></div></fieldset>{error && <p className="error">{error}</p>}<label className="privacy-consent"><input type="checkbox" checked={fields.privacyConsent} onChange={(event) => setFields({ ...fields, privacyConsent: event.target.checked })} required /><span>Concordo com o uso dos meus dados para criação e gestão da conta e aceito a <a href="/privacidade">política de privacidade</a>.</span></label><button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Criando conta...' : 'Criar conta'}</button></form>;
}
