const SESSION_STORAGE_KEY = 'origem:session';

interface SessionStorageUser {
	id: string;
	artisanId?: string;
	name?: string;
	email?: string;
	expiresAt?: number;
}

export function readSessionStorageUser(): SessionStorageUser | null {
	if (typeof window === 'undefined') return null;
	try {
		const user = JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY) ?? 'null') as SessionStorageUser | null;
		if (!user?.id || (user.expiresAt && user.expiresAt < Date.now())) return null;
		return user;
	} catch {
		return null;
	}
}

export function getUserScopedStorageKey(key: string): string {
	const userId = readSessionStorageUser()?.id;
	return `${key}:${userId ? encodeURIComponent(userId) : 'guest'}`;
}

export function getUserStorageKeyForId(key: string, userId: string): string {
	return `${key}:${encodeURIComponent(userId)}`;
}

export function readAllUserScopedStorageEntries<T>(key: string): Array<{ userId: string; value: T }> {
	if (typeof window === 'undefined') return [];
	const prefix = `${key}:`;
	const entries: Array<{ userId: string; value: T }> = [];
	for (let index = 0; index < localStorage.length; index += 1) {
		const storageKey = localStorage.key(index);
		if (!storageKey?.startsWith(prefix)) continue;
		try {
			entries.push({
				userId: decodeURIComponent(storageKey.slice(prefix.length)),
				value: JSON.parse(localStorage.getItem(storageKey) ?? 'null') as T,
			});
		} catch {
			continue;
		}
	}
	return entries;
}
