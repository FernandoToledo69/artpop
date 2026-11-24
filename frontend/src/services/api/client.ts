const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const TOKEN_KEY = 'origem:api-token';

export function isApiConfigured(): boolean {
	return Boolean(API_URL);
}

export function getApiToken(): string | null {
	if (typeof window === 'undefined') return null;
	return window.sessionStorage.getItem(TOKEN_KEY);
}

export function setApiToken(token: string | null): void {
	if (typeof window === 'undefined') return;
	if (token) window.sessionStorage.setItem(TOKEN_KEY, token);
	else window.sessionStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	if (!API_URL) throw new Error('A URL da API ainda não foi configurada.');
	const token = getApiToken();
	const response = await fetch(`${API_URL}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...init.headers,
		},
		credentials: 'include',
	});
	if (!response.ok) throw new Error(`A API retornou status ${response.status}.`);
	if (response.status === 204) return undefined as T;
	return response.json() as Promise<T>;
}
