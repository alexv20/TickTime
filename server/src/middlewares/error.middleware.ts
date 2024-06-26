import ApiError from '../exceptions/apiError';
import { Request, Response, NextFunction } from 'express';

export default function (err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, errors: err.errors });
  }

  return res.status(500).json({ message: 'Непредвиденная ошибка' });
}
