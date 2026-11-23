import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { routes } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: '10mb' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', routes);
app.use(errorMiddleware);