import { AuthUser } from '../../types/auth';
import { clearStoredSession, hasStoredSession, saveStoredSession } from './auth-session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const AUTH_ENDPOINTS = new Set([
	'/api/auth/login',
	'/api/auth/register',
	'/api/auth/refresh',
	'/api/auth/logout',
]);
let accessToken: string | null = null;
let refreshRequest: Promise<string | null> | null = null;

export function isApiConfigured(): boolean {
	return Boolean(API_URL);
}

export function getApiToken(): string | null {
	return accessToken;
}

export function setApiToken(token: string | null): void {
	accessToken = token;
}

function request(path: string, init: RequestInit, token: string | null): Promise<Response> {
	return fetch(`${API_URL}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...init.headers,
		},
		credentials: 'include',
	});
}

async function refreshAccessToken(): Promise<string | null> {
	if (!refreshRequest) {
		refreshRequest = (async () => {
			const response = await request('/api/auth/refresh', { method: 'POST' }, null);
			if (!response.ok) return null;
			const result = await response.json() as { token: string; user: AuthUser; expiresAt: number };
			setApiToken(result.token);
			saveStoredSession({ ...result.user, expiresAt: result.expiresAt });
			window.dispatchEvent(new Event('auth-updated'));
			return result.token;
		})().finally(() => {
			refreshRequest = null;
		});
	}
	return refreshRequest;
}

function expireSession(): void {
	setApiToken(null);
	clearStoredSession();
	window.dispatchEvent(new Event('auth-updated'));
	window.location.assign('/login');
}

async function readErrorMessage(response: Response): Promise<string> {
	const body = await response.json().catch(() => undefined) as { error?: unknown } | undefined;
	return typeof body?.error === 'string' ? body.error : `A API retornou status ${response.status}.`;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	if (!API_URL) throw new Error('A URL da API ainda não foi configurada.');
	let response = await request(path, init, getApiToken());
	if (response.status === 401 && !AUTH_ENDPOINTS.has(path) && hasStoredSession()) {
		const token = await refreshAccessToken();
		if (!token) {
			expireSession();
			throw new Error('Sua sessão expirou. Entre novamente.');
		}
		response = await request(path, init, token);
		if (response.status === 401) {
			expireSession();
			throw new Error('Sua sessão expirou. Entre novamente.');
		}
	}
	if (!response.ok) {
		throw new Error(await readErrorMessage(response));
	}
	if (response.status === 204) return undefined as T;
	return response.json() as Promise<T>;
}
