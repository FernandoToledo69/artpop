 'use client';

import { FormEvent, useState } from 'react';
import { register } from '../../services/api/auth.service';

export default function RegisterForm() {
	const [fields, setFields] = useState({ name: '', email: '', password: '', role: 'buyer' as 'buyer' | 'artisan' });
	const [error, setError] = useState('');
	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		try { register(fields.name, fields.email, fields.password, fields.role); window.location.href = fields.role === 'artisan' ? '/painel-artesao' : '/'; } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível criar a conta.'); }
	}
	return <form className="payment-fields" onSubmit={handleSubmit}><label className="field field-wide">Nome<input value={fields.name} onChange={(event) => setFields({ ...fields, name: event.target.value })} required /></label><label className="field field-wide">E-mail<input type="email" value={fields.email} onChange={(event) => setFields({ ...fields, email: event.target.value })} required /></label><label className="field field-wide">Senha<input type="password" minLength={6} value={fields.password} onChange={(event) => setFields({ ...fields, password: event.target.value })} required /></label><label className="field field-wide">Tipo de conta<select value={fields.role} onChange={(event) => setFields({ ...fields, role: event.target.value as 'buyer' | 'artisan' })}><option value="buyer">Comprador</option><option value="artisan">Artesão</option></select></label>{error && <p className="error">{error}</p>}<button type="submit">Criar conta</button></form>;
}
