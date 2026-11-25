import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { AppError } from '../utils/AppError';

export const artisanRoutes = Router();

artisanRoutes.get('/', async (_req, res, next) => {
  try {
    const artisans = await prisma.artisan.findMany({
      where: { status: 'ACTIVE' },
      include: { products: true },
      orderBy: { name: 'asc' },
    });
    res.json(artisans.map((artisan) => ({
      id: artisan.id,
      name: artisan.name,
      city: artisan.city,
      state: artisan.state,
      phone: artisan.phone,
      bio: artisan.bio,
      avatarImage: artisan.avatarImage,
      products: artisan.products.map((product) => ({
        id: product.id,
        title: product.title,
        technique: product.technique,
        price: Number(product.price),
        stock: product.stock,
        mainImage: product.mainImage,
        additionalImages: product.additionalImages,
      })),
    })));
  } catch (error) {
    next(error);
  }
});

artisanRoutes.get('/:id', async (req, res, next) => {
  try {
    const artisan = await prisma.artisan.findUnique({
      where: { id: req.params.id },
      include: { products: true },
    });
    if (!artisan || artisan.status !== 'ACTIVE') throw new AppError(404, 'Artesão não encontrado.');
    res.json({
      id: artisan.id,
      name: artisan.name,
      city: artisan.city,
      state: artisan.state,
      phone: artisan.phone,
      bio: artisan.bio,
      avatarImage: artisan.avatarImage,
      products: artisan.products.map((product) => ({
        id: product.id,
        title: product.title,
        technique: product.technique,
        price: Number(product.price),
        stock: product.stock,
        mainImage: product.mainImage,
        additionalImages: product.additionalImages,
      })),
    });
  } catch (error) {
    next(error);
  }
});

artisanRoutes.patch('/perfil', authMiddleware, roleMiddleware('ARTISAN'), async (req, res, next) => {
  try {
    const data = z.object({
      name: z.string().trim().min(2).optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      phone: z.string().trim().optional(),
      bio: z.string().optional(),
      avatarImage: z.string().optional(),
    }).parse(req.body);
    const artisan = await prisma.artisan.update({
      where: { userId: req.auth!.sub },
      data,
    });
    res.json(artisan);
  } catch (error) {
    next(error);
  }
});