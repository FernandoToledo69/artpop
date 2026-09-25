import { AccountRecord, AuthUser, UserRole } from '../../types/auth';
import { clearCart } from './carrinho.service';

const ACCOUNTS_KEY = 'origem:accounts';
const SESSION_KEY = 'origem:session';
const LOGIN_ATTEMPTS_KEY = 'origem:login-attempts';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

const defaultAccountCredentials = [
  { id: 'admin-1', name: 'Admin artpop', email: 'admin@artpop.local', password: 'admin123', role: 'admin' as const },
  { id: 'artisan-1', name: 'Stefani Germanotta', email: 'ana.lima@email.com', password: '123456', role: 'artisan' as const, artisanId: 'stefani-germanotta' },
];

async function hashValue(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function normalizeEmail(email: string): string { return email.trim().toLowerCase(); }
function normalizeDigits(value: string): string { return value.replace(/\D/g, ''); }
function maskPhone(phone: string): string { const digits = normalizeDigits(phone); return digits.length < 4 ? '' : `••••${digits.slice(-4)}`; }
function isValidCpf(cpf: string): boolean {
  const digits = normalizeDigits(cpf);
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  for (let index = 0; index < 9; index += 1) sum += Number(digits[index]) * (10 - index);
  let first = (sum * 10) % 11; if (first === 10) first = 0;
  if (first !== Number(digits[9])) return false;
  sum = 0;
  for (let index = 0; index < 10; index += 1) sum += Number(digits[index]) * (11 - index);
  let second = (sum * 10) % 11; if (second === 10) second = 0;
  return second === Number(digits[10]);
}

async function readAccounts(): Promise<AccountRecord[]> {
  if (typeof window === 'undefined') return [];
  try {
    const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? 'null') as (AccountRecord & { password?: string })[] | null;
    if (saved?.length) {
      const migrated = await Promise.all(saved.map(async (account) => {
        if (account.passwordHash) return account;
        const { password, ...safeAccount } = account;
        return { ...safeAccount, passwordHash: await hashValue(password ?? '') } as AccountRecord;
      }));
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch { /* use defaults */ }
  const defaults = await Promise.all(defaultAccountCredentials.map(async ({ password, ...account }) => ({ ...account, passwordHash: await hashValue(password) })));
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(defaults));
  return defaults;
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const user = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as AuthUser | null;
    if (user?.expiresAt && user.expiresAt < Date.now()) { localStorage.removeItem(SESSION_KEY); return null; }
    return user;
  } catch { return null; }
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) ?? '{"count":0,"lockedUntil":0}') as { count: number; lockedUntil: number };
  if (attempts.lockedUntil > Date.now()) throw new Error('Muitas tentativas. Aguarde um minuto e tente novamente.');
  const accounts = await readAccounts();
  const passwordHash = await hashValue(password);
  const account = accounts.find((item) => normalizeEmail(item.email) === normalizeEmail(email) && item.passwordHash === passwordHash);
  if (!account) {
    const count = attempts.count + 1;
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify({ count, lockedUntil: count >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0 }));
    throw new Error('E-mail ou senha inválidos.');
  }
  localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
  const user: AuthUser = { id: account.id, name: account.name, email: account.email, role: account.role, artisanId: account.artisanId, phoneLast4: account.phoneMasked?.slice(-4), cpfLast4: account.cpfLast4, expiresAt: Date.now() + 8 * 60 * 60 * 1000 };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event('auth-updated'));
  return user;
}

export async function register(name: string, email: string, password: string, phone: string, cpf: string, role: UserRole = 'buyer'): Promise<AuthUser> {
  const accounts = await readAccounts();
  if (accounts.some((item) => normalizeEmail(item.email) === normalizeEmail(email))) throw new Error('Este e-mail já está cadastrado.');
  if (!isValidCpf(cpf)) throw new Error('Informe um CPF válido.');
  const phoneDigits = normalizeDigits(phone);
  if (phoneDigits.length < 10 || phoneDigits.length > 11) throw new Error('Informe um telefone válido.');
  const account: AccountRecord = { id: crypto.randomUUID(), name: name.trim(), email: email.trim(), passwordHash: await hashValue(password), phoneMasked: maskPhone(phone), cpfHash: await hashValue(normalizeDigits(cpf)), cpfLast4: normalizeDigits(cpf).slice(-4), role, artisanId: role === 'artisan' ? crypto.randomUUID() : undefined };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  return login(account.email, password);
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
  clearCart();
  localStorage.removeItem('origem:payment-profile');
  window.dispatchEvent(new Event('auth-updated'));
}