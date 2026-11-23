import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

export interface AuthPayload {
  sub: string;
  role: 'BUYER' | 'ARTISAN' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError(401, 'Autenticação necessária.');
  try {
    req.auth = jwt.verify(header.slice(7), env.jwtSecret) as AuthPayload;
    next();
  } catch {
    throw new AppError(401, 'Token inválido ou expirado.');
  }
}