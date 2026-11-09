import { getUserScopedStorageKey } from './user-storage';

const FAVORITES_STORAGE_KEY = 'origem:favorites';

function getFavoritesStorageKey(): string {
	return getUserScopedStorageKey(FAVORITES_STORAGE_KEY);
}

export function readFavoriteIds(): string[] {
	if (typeof window === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(getFavoritesStorageKey()) ?? '[]') as string[];
	} catch {
		return [];
	}
}

export function isFavorite(productId: string): boolean {
	return readFavoriteIds().includes(productId);
}

export function toggleFavorite(productId: string): string[] {
	if (typeof window === 'undefined') return [];
	const favoriteIds = readFavoriteIds();
	const nextFavorites = favoriteIds.includes(productId)
		? favoriteIds.filter((id) => id !== productId)
		: [...favoriteIds, productId];
	localStorage.setItem(getFavoritesStorageKey(), JSON.stringify(nextFavorites));
	return nextFavorites;
}