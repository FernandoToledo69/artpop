import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { AppError } from '../utils/AppError';
import { sendArtisanRejectionEmail } from '../services/email.service';

export const adminRoutes = Router();
adminRoutes.use(authMiddleware, roleMiddleware('ADMIN'));

adminRoutes.get('/indicadores', async (_req, res, next) => {
  try {
    const [users, artisans, products, orders] = await Promise.all([
      prisma.user.count(),
      prisma.artisan.count(),
      prisma.product.count(),
      prisma.order.count(),
    ]);
    res.json({ users, artisans, products, orders });
  } catch (error) {
    next(error);
  }
});

adminRoutes.get('/pedidos', async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

adminRoutes.get('/artesaos/pendentes', async (_req, res, next) => {
  try {
    const artisans = await prisma.artisan.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(artisans);
  } catch (error) {
    next(error);
  }
});

const moderationSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('ACTIVE') }),
  z.object({ status: z.literal('REJECTED'), reason: z.string().trim().min(1).max(1000) }),
]);

adminRoutes.patch('/artesaos/:id/moderacao', async (req, res, next) => {
  try {
    const data = moderationSchema.parse(req.body);
    const artisan = await prisma.artisan.findUnique({
      where: { id: String(req.params.id) },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!artisan) throw new AppError(404, 'Cadastro de artesão não encontrado.');
    if (artisan.status !== 'PENDING') throw new AppError(409, 'Este cadastro já foi moderado.');

    if (data.status === 'REJECTED') {
      await sendArtisanRejectionEmail(artisan.user.email, artisan.name, data.reason);
    }

    const result = await prisma.artisan.updateMany({
      where: { id: artisan.id, status: 'PENDING' },
      data: {
        status: data.status,
        rejectionReason: data.status === 'REJECTED' ? data.reason : null,
      },
    });
    if (result.count === 0) throw new AppError(409, 'Este cadastro já foi moderado.');

    const updatedArtisan = await prisma.artisan.findUnique({ where: { id: artisan.id } });
    res.json(updatedArtisan);
  } catch (error) {
    next(error);
  }
});