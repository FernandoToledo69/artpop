import { Router } from 'express';
import { z } from 'zod';
import { ProductCategory } from '@prisma/client';
import { prisma } from '../config/database';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { AppError } from '../utils/AppError';

export const productRoutes = Router();

const categoryMap: Record<string, ProductCategory> = {
  ceramica: 'CERAMICA',
  madeira: 'MADEIRA',
  textil: 'TEXTIL',
  joalheria: 'JOALHERIA',
  outros: 'OUTROS',
};

const productSchema = z.object({
  title: z.string().trim().min(2),
  category: z.enum(['ceramica', 'madeira', 'textil', 'joalheria', 'outros']),
  technique: z.string().trim().min(1),
  description: z.string().trim().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
  weightKg: z.coerce.number().positive(),
  lengthCm: z.coerce.number().positive(),
  widthCm: z.coerce.number().positive(),
  heightCm: z.coerce.number().positive(),
  mainImage: z.string().trim().min(1),
  additionalImages: z.array(z.string()).default([]),
});

function mapProduct(product: any) {
  return {
    id: product.id,
    title: product.title,
    category: product.category.toLowerCase(),
    technique: product.technique,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    weightKg: product.weightKg,
    lengthCm: product.lengthCm,
    widthCm: product.widthCm,
    heightCm: product.heightCm,
    mainImage: product.mainImage,
    additionalImages: product.additionalImages,
    shippingMeasurementsEstimated: product.shippingEstimated,
    createdAt: product.createdAt.toISOString(),
    artisanId: product.artisanId,
    artisanName: product.artisan.name,
    artisanCity: product.artisan.city,
    artisanBio: product.artisan.bio,
  };
}

productRoutes.get('/', async (req, res, next) => {
  try {
    const category = typeof req.query.category === 'string' ? categoryMap[req.query.category] : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const products = await prisma.product.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(search ? { OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { technique: { contains: search, mode: 'insensitive' } },
          { artisan: { city: { contains: search, mode: 'insensitive' } } },
        ] } : {}),
      },
      include: { artisan: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products.map(mapProduct));
  } catch (error) {
    next(error);
  }
});

productRoutes.get('/:id', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: String(req.params.id) }, include: { artisan: true } });
    if (!product) throw new AppError(404, 'Produto não encontrado.');
    res.json(mapProduct(product));
  } catch (error) {
    next(error);
  }
});

productRoutes.post('/', authMiddleware, roleMiddleware('ARTISAN'), async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.auth!.sub } });
    if (!artisan) throw new AppError(404, 'Perfil de artesão não encontrado.');
    const product = await prisma.product.create({
      data: {
        ...data,
        category: categoryMap[data.category],
        artisanId: artisan.id,
      },
      include: { artisan: true },
    });
    res.status(201).json(mapProduct(product));
  } catch (error) {
    next(error);
  }
});

productRoutes.patch('/:id', authMiddleware, roleMiddleware('ARTISAN'), async (req, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.auth!.sub } });
    const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } });
    if (!product || product.artisanId !== artisan?.id) throw new AppError(404, 'Produto não encontrado.');
    const { category, ...rest } = data;
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        ...rest,
        ...(category ? { category: categoryMap[category] } : {}),
      },
      include: { artisan: true },
    });
    res.json(mapProduct(updated));
  } catch (error) {
    next(error);
  }
});

productRoutes.delete('/:id', authMiddleware, roleMiddleware('ARTISAN', 'ADMIN'), async (req, res, next) => {
  try {
    const artisan = await prisma.artisan.findUnique({ where: { userId: req.auth!.sub } });
    const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } });
    if (!product || (req.auth!.role === 'ARTISAN' && product.artisanId !== artisan?.id)) {
      throw new AppError(404, 'Produto não encontrado.');
    }
    await prisma.product.delete({ where: { id: product.id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});