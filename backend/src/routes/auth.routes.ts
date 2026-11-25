import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export const authRoutes = Router();

const refreshCookieName = 'artpop_refresh';
const refreshSessionTtlMs = 30 * 24 * 60 * 60 * 1000;
const accessTokenLifetime = '15m';

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  role: z.enum(['buyer', 'artisan']).default('buyer'),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

function roleToPrisma(role: 'buyer' | 'artisan') {
  return role === 'artisan' ? 'ARTISAN' : 'BUYER';
}

interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'BUYER' | 'ARTISAN' | 'ADMIN';
  cpfLast4: string | null;
  artisan: { id: string } | null;
}

function publicUser(user: AuthenticatedUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    cpfLast4: user.cpfLast4 ?? undefined,
    artisanId: user.artisan?.id,
  };
}

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function readRefreshToken(req: Request): string | null {
  const cookiePrefix = `${refreshCookieName}=`;
  const cookie = req.headers.cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(cookiePrefix));
  return cookie?.slice(cookiePrefix.length) || null;
}

function refreshCookieOptions() {
  const secure = env.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' as const : 'lax' as const,
    path: '/api/auth',
  };
}

function setRefreshCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(refreshCookieName, token, {
    ...refreshCookieOptions(),
    expires: expiresAt,
  });
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(refreshCookieName, refreshCookieOptions());
}

async function createSession(user: AuthenticatedUser, res: Response) {
  const refreshToken = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + refreshSessionTtlMs);
  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt,
    },
  });
  setRefreshCookie(res, refreshToken, expiresAt);
  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: accessTokenLifetime });
  return { token, expiresAt: expiresAt.getTime(), user: publicUser(user) };
}

authRoutes.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const email = data.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email } })) throw new AppError(409, 'Este e-mail já está cadastrado.');

    const role = roleToPrisma(data.role);
    const passwordHash = await bcrypt.hash(data.password, 12);
    const cpfDigits = data.cpf?.replace(/\D/g, '');
    const cpfHash = cpfDigits ? await bcrypt.hash(cpfDigits, 10) : null;

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
        passwordHash,
        phone: data.phone,
        cpfHash,
        cpfLast4: cpfDigits ? cpfDigits.slice(-4) : null,
        role,
        artisan: role === 'ARTISAN' ? { create: { name: data.name } } : undefined,
      },
      include: { artisan: true },
    });
    res.status(201).json(await createSession(user, res));
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: { artisan: true },
    });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
      throw new AppError(401, 'E-mail ou senha inválidos.');
    }
    res.json(await createSession(user, res));
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = readRefreshToken(req);
    if (!refreshToken) {
      clearRefreshCookie(res);
      throw new AppError(401, 'Sessão expirada. Entre novamente.');
    }

    const session = await prisma.refreshSession.findUnique({
      where: { tokenHash: hashRefreshToken(refreshToken) },
      include: { user: { include: { artisan: true } } },
    });
    const now = new Date();
    if (!session || session.revokedAt || session.expiresAt <= now) {
      clearRefreshCookie(res);
      throw new AppError(401, 'Sessão expirada. Entre novamente.');
    }

    await prisma.refreshSession.update({
      where: { id: session.id },
      data: { lastUsedAt: now },
    });
    const token = jwt.sign(
      { sub: session.user.id, role: session.user.role },
      env.jwtSecret,
      { expiresIn: accessTokenLifetime },
    );
    res.json({
      token,
      expiresAt: session.expiresAt.getTime(),
      user: publicUser(session.user),
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/logout', async (req, res, next) => {
  try {
    clearRefreshCookie(res);
    const refreshToken = readRefreshToken(req);
    if (refreshToken) {
      await prisma.refreshSession.updateMany({
        where: { tokenHash: hashRefreshToken(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});