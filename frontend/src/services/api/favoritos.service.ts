const FAVORITES_STORAGE_KEY = 'origem:favorites';

export function readFavoriteIds(): string[] {
	if (typeof window === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? '[]') as string[];
	} catch {
		return [];
	}
}

export function isFavorite(productId: string): boolean {
	return readFavoriteIds().includes(productId);
}

export function toggleFavorite(productId: string): string[] {
	const favoriteIds = readFavoriteIds();
	const nextFavorites = favoriteIds.includes(productId)
		? favoriteIds.filter((id) => id !== productId)
		: [...favoriteIds, productId];
	localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));
	return nextFavorites;
}