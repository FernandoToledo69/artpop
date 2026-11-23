import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export function roleMiddleware(...roles: Array<'BUYER' | 'ARTISAN' | 'ADMIN'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) throw new AppError(403, 'Permissão insuficiente.');
    next();
  };
}