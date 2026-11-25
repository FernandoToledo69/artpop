import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export const authRoutes = Router();

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

function publicUser(user: { id: string; name: string; email: string; role: 'BUYER' | 'ARTISAN' | 'ADMIN'; cpfLast4: string | null; artisan: { id: string } | null }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    cpfLast4: user.cpfLast4 ?? undefined,
    artisanId: user.artisan?.id,
  };
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
    const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: '8h' });
    res.status(201).json({ token, user: publicUser(user) });
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
    const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: '8h' });
    res.json({ token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});