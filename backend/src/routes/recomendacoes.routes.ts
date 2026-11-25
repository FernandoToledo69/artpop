import { Router } from 'express';
import { prisma } from '../config/database';
import { requestRecommendations } from '../integrations/recommendation.client';
import { RecommendationProduct } from '../recommendation-service/recommendation.types';

export const recommendationRoutes = Router();

recommendationRoutes.get('/', async (req, res, next) => {
  try {
    const productId = typeof req.query.productId === 'string' ? req.query.productId : undefined;
    const base = productId
      ? await prisma.product.findFirst({
        where: { id: productId, artisan: { is: { status: 'ACTIVE' } } },
        include: { artisan: true },
      })
      : null;
    const products = await prisma.product.findMany({
      where: {
        artisan: { is: { status: 'ACTIVE' } },
        ...(productId ? { id: { not: productId } } : {}),
      },
      include: { artisan: true },
      orderBy: { createdAt: 'desc' },
    });
    const toPublicProduct = (product: typeof products[number]) => ({
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
    });
    if (!base) {
      res.json(products.slice(0, 8).map(toPublicProduct));
      return;
    }

    const toRecommendationProduct = (product: typeof products[number]): RecommendationProduct => ({
      id: product.id,
      title: product.title,
      category: product.category,
      technique: product.technique,
      description: product.description,
      price: Number(product.price),
      artisanId: product.artisanId,
    });
    const result = await requestRecommendations(
      toRecommendationProduct(base),
      products.map(toRecommendationProduct),
    );
    const productsById = new Map(products.map((product) => [product.id, product]));
    const recommendedProducts = result.recommendations.flatMap(({ id }) => {
      const product = productsById.get(id);
      return product ? [toPublicProduct(product)] : [];
    });
    res.json(recommendedProducts);
  } catch (error) {
    next(error);
  }
});