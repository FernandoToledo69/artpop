export type UserRole = 'buyer' | 'artisan' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  artisanId?: string;
  phoneLast4?: string;
  cpfLast4?: string;
  expiresAt?: number;
}

export interface AccountRecord extends AuthUser {
  passwordHash: string;
  phoneMasked?: string;
  cpfHash?: string;
}