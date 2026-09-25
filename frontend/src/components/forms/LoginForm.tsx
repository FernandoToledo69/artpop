 'use client';

import { FormEvent, useState } from 'react';
import { login } from '../../services/api/auth.service';

export default function LoginForm() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		try { await login(email, password); window.location.href = '/'; } catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível entrar.'); }
	}

	return <form className="payment-fields" onSubmit={handleSubmit}><label className="field field-wide">E-mail<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="field field-wide">Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="error">{error}</p>}<button type="submit">Entrar</button><small>Demo: admin@artpop.local / admin123 ou ana.lima@email.com / 123456</small></form>;
}
