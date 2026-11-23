import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';

export const userRoutes = Router();
userRoutes.use(authMiddleware);

userRoutes.get('/perfil', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.sub },
      include: { artisan: true },
    });
    if (!user) throw new AppError(404, 'Usuário não encontrado.');
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role.toLowerCase(),
      cpfLast4: user.cpfLast4,
      artisan: user.artisan,
    });
  } catch (error) {
    next(error);
  }
});

userRoutes.patch('/perfil', async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().trim().min(2).optional(),
      phone: z.string().trim().optional(),
    }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.auth!.sub },
      data,
      include: { artisan: true },
    });
    res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, artisan: user.artisan });
  } catch (error) {
    next(error);
  }
});