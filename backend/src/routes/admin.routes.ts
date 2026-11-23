import { Router } from 'express';
import { prisma } from '../config/database';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

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