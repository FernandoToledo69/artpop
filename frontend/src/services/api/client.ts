const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	if (!API_URL) throw new Error('A URL da API ainda não foi configurada.');
	const response = await fetch(`${API_URL}${path}`, {
		...init,
		headers: { 'Content-Type': 'application/json', ...init.headers },
		credentials: 'include',
	});
	if (!response.ok) throw new Error(`A API retornou status ${response.status}.`);
	if (response.status === 204) return undefined as T;
	return response.json() as Promise<T>;
}
