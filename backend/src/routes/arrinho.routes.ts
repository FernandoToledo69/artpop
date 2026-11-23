import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';

export const cartRoutes = Router();
cartRoutes.use(authMiddleware);

cartRoutes.get('/', async (req, res, next) => {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.auth!.sub },
      include: { product: { include: { artisan: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items.map((item) => ({
      id: item.product.id,
      title: item.product.title,
      artisanName: item.product.artisan.name,
      artisanId: item.product.artisanId,
      artisanCity: item.product.artisan.city,
      price: Number(item.product.price),
      quantity: item.quantity,
      stock: item.product.stock,
      weightKg: item.product.weightKg,
      lengthCm: item.product.lengthCm,
      widthCm: item.product.widthCm,
      heightCm: item.product.heightCm,
      category: item.product.category.toLowerCase(),
      mainImage: item.product.mainImage,
    })));
  } catch (error) {
    next(error);
  }
});

cartRoutes.put('/:productId', async (req, res, next) => {
  try {
    const { quantity } = z.object({ quantity: z.coerce.number().int().positive() }).parse(req.body);
    const product = await prisma.product.findUnique({ where: { id: req.params.productId }, include: { artisan: true } });
    if (!product) throw new AppError(404, 'Produto não encontrado.');
    if (quantity > product.stock) throw new AppError(409, 'Quantidade maior que o estoque disponível.');
    const buyer = await prisma.user.findUnique({ where: { id: req.auth!.sub }, include: { artisan: true } });
    if (buyer?.artisan?.id === product.artisanId) throw new AppError(403, 'Você não pode comprar sua própria obra.');
    await prisma.cartItem.upsert({
      where: { userId_productId: { userId: req.auth!.sub, productId: product.id } },
      update: { quantity },
      create: { userId: req.auth!.sub, productId: product.id, quantity },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

cartRoutes.delete('/:productId', async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.auth!.sub, productId: req.params.productId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

cartRoutes.delete('/', async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.auth!.sub } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});