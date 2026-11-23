import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { productRoutes } from './produtos.routes';
import { cartRoutes } from './arrinho.routes';
import { artisanRoutes } from './artesoes.routes';
import { orderRoutes } from './pedidos.routes';
import { userRoutes } from './usuarios.routes';
import { reviewRoutes } from './avaliacoes.routes';
import { recommendationRoutes } from './recomendacoes.routes';
import { adminRoutes } from './admin.routes';
import { swaggerDocument } from '../docs/swagger';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/produtos', productRoutes);
routes.use('/carrinho', cartRoutes);
routes.use('/artesoes', artisanRoutes);
routes.use('/pedidos', orderRoutes);
routes.use('/usuarios', userRoutes);
routes.use('/avaliacoes', reviewRoutes);
routes.use('/recomendacoes', recommendationRoutes);
routes.use('/admin', adminRoutes);
routes.get('/docs', (_req, res) => res.json(swaggerDocument));