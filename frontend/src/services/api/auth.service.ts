import { AccountRecord, AuthUser, UserRole } from '../../types/auth';

const ACCOUNTS_KEY = 'origem:accounts';
const SESSION_KEY = 'origem:session';

const defaultAccounts: AccountRecord[] = [
  { id: 'admin-1', name: 'Admin artpop', email: 'admin@artpop.local', password: 'admin123', role: 'admin' },
  { id: 'artisan-1', name: 'Stefani Germanotta', email: 'ana.lima@email.com', password: '123456', role: 'artisan', artisanId: 'stefani-germanotta' },
];

function readAccounts(): AccountRecord[] {
  if (typeof window === 'undefined') return defaultAccounts;
  try {
    const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? 'null') as AccountRecord[] | null;
    if (saved?.length) return saved;
  } catch { /* use defaults */ }
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(defaultAccounts));
  return defaultAccounts;
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as AuthUser | null; } catch { return null; }
}

export function login(email: string, password: string): AuthUser {
  const account = readAccounts().find((item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
  if (!account) throw new Error('E-mail ou senha inválidos.');
  const user: AuthUser = { id: account.id, name: account.name, email: account.email, role: account.role, artisanId: account.artisanId };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('auth-updated'));
  return user;
}

export function register(name: string, email: string, password: string, role: UserRole = 'buyer'): AuthUser {
  const accounts = readAccounts();
  if (accounts.some((item) => item.email.toLowerCase() === email.trim().toLowerCase())) throw new Error('Este e-mail já está cadastrado.');
  const account: AccountRecord = { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), password, role, artisanId: role === 'artisan' ? crypto.randomUUID() : undefined };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  return login(account.email, password);
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event('auth-updated'));
}