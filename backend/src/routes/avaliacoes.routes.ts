import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authMiddleware } from '../middlewares/auth.middleware';

export const reviewRoutes = Router();

reviewRoutes.get('/', async (req, res, next) => {
  try {
    const productId = typeof req.query.productId === 'string' ? req.query.productId : undefined;
    const reviews = await prisma.review.findMany({
      where: productId ? { productId } : undefined,
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

reviewRoutes.post('/', authMiddleware, async (req, res, next) => {
  try {
    const data = z.object({
      productId: z.string().min(1),
      rating: z.number().int().min(1).max(5),
      comment: z.string().trim().min(1).max(1000),
    }).parse(req.body);
    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: req.auth!.sub, productId: data.productId } },
      update: { rating: data.rating, comment: data.comment },
      create: { userId: req.auth!.sub, ...data },
      include: { user: { select: { id: true, name: true } } },
    });
    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});