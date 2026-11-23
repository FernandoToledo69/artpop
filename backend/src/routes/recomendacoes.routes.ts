import { Router } from 'express';
import { prisma } from '../config/database';

export const recommendationRoutes = Router();

recommendationRoutes.get('/', async (req, res, next) => {
  try {
    const productId = typeof req.query.productId === 'string' ? req.query.productId : undefined;
    const base = productId
      ? await prisma.product.findUnique({ where: { id: productId }, select: { category: true } })
      : null;
    const products = await prisma.product.findMany({
      where: base ? { category: base.category, ...(productId ? { id: { not: productId } } : {}) } : undefined,
      include: { artisan: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
});