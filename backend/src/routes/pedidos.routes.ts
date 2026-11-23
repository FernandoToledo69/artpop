import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { AppError } from '../utils/AppError';

export const orderRoutes = Router();
orderRoutes.use(authMiddleware);

const statusMap: Record<string, 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED'> = {
  'Pendente': 'PENDING',
  'Enviado': 'SHIPPED',
  'Concluído': 'COMPLETED',
  'Cancelado': 'CANCELLED',
};

function mapOrder(order: any) {
  return {
    id: order.id,
    number: order.number,
    createdAt: order.createdAt.toISOString(),
    status: Object.entries(statusMap).find(([, value]) => value === order.status)?.[0] ?? 'Pendente',
    total: Number(order.subtotal) - Number(order.discount) + Number(order.shipping),
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: order.shippingName ? {
      name: order.shippingName,
      price: Number(order.shipping),
      deliveryTime: order.deliveryTime,
    } : undefined,
    payment: { brand: order.paymentBrand, last4: order.paymentLast4 },
    items: order.items.map((item: any) => ({
      id: item.productId,
      title: item.title,
      quantity: item.quantity,
      price: Number(item.price),
    })),
  };
}

orderRoutes.get('/', async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: req.auth!.role === 'ADMIN' ? {} : { userId: req.auth!.sub },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders.map(mapOrder));
  } catch (error) {
    next(error);
  }
});

const checkoutSchema = z.object({
  couponCode: z.string().optional(),
  shipping: z.object({
    name: z.string(),
    price: z.number().nonnegative(),
    deliveryTime: z.string(),
  }).optional(),
  payment: z.object({
    brand: z.enum(['Visa', 'Mastercard', 'Elo', 'Cartão', 'Pix']),
    last4: z.string(),
  }),
});

orderRoutes.post('/checkout', async (req, res, next) => {
  try {
    const data = checkoutSchema.parse(req.body);
    const order = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId: req.auth!.sub },
        include: { product: true },
      });
      if (cartItems.length === 0) throw new AppError(400, 'O carrinho está vazio.');

      let subtotal = 0;
      for (const item of cartItems) {
        if (item.quantity > item.product.stock) throw new AppError(409, `Estoque insuficiente para ${item.product.title}.`);
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) throw new AppError(409, 'Estoque alterado durante o checkout.');
        subtotal += Number(item.product.price) * item.quantity;
      }

      const couponDiscounts: Record<string, number> = {
        ARTPOP10: 0.10,
        BEMVINDO15: 0.15,
        FEITOAMANO20: 0.20,
        CULTURA25: 0.25,
      };
      const discount = data.couponCode && couponDiscounts[data.couponCode.toUpperCase()]
        ? Math.round(subtotal * couponDiscounts[data.couponCode.toUpperCase()] * 100) / 100
        : 0;
      const shippingPrice = data.shipping?.price ?? 0;
      const created = await tx.order.create({
        data: {
          number: `PED-${Date.now().toString().slice(-8)}`,
          userId: req.auth!.sub,
          subtotal,
          discount,
          shipping: shippingPrice,
          shippingName: data.shipping?.name,
          deliveryTime: data.shipping?.deliveryTime,
          paymentBrand: data.payment.brand,
          paymentLast4: data.payment.last4,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              title: item.product.title,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
        },
        include: { items: true },
      });
      await tx.cartItem.deleteMany({ where: { userId: req.auth!.sub } });
      return created;
    }, { isolationLevel: 'Serializable' });
    res.status(201).json(mapOrder(order));
  } catch (error) {
    next(error);
  }
});

orderRoutes.patch('/:id/status', roleMiddleware('ARTISAN', 'ADMIN'), async (req, res, next) => {
  try {
    const data = z.object({ status: z.enum(['Pendente', 'Enviado', 'Concluído', 'Cancelado']) }).parse(req.body);
    const order = await prisma.order.findUnique({ where: { id: String(req.params.id) }, include: { items: true } });
    if (!order) throw new AppError(404, 'Pedido não encontrado.');
    if (req.auth!.role === 'ARTISAN') {
      const artisan = await prisma.artisan.findUnique({ where: { userId: req.auth!.sub } });
      const hasItem = await prisma.product.count({ where: { id: { in: order.items.map((item) => item.productId) }, artisanId: artisan?.id } });
      if (!hasItem) throw new AppError(403, 'Este pedido não pertence ao seu catálogo.');
    }
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: statusMap[data.status] },
      include: { items: true },
    });
    res.json(mapOrder(updated));
  } catch (error) {
    next(error);
  }
});