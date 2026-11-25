import { AuthUser } from '../../types/auth';

export const SESSION_KEY = 'origem:session';

export function hasStoredSession(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage.getItem(SESSION_KEY));
}

export function saveStoredSession(user: AuthUser): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearStoredSession(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(SESSION_KEY);
}
