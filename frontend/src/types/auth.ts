export type UserRole = 'buyer' | 'artisan' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  artisanId?: string;
}

export interface AccountRecord extends AuthUser {
  password: string;
}