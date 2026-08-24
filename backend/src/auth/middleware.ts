import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors';
import { verifyAccessToken } from './service';

// Augment Request with authenticated userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/** Verifies the Bearer token and attaches `req.userId`. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Missing authorization header'));
  }

  const token = header.slice(7);

  try {
    const { sub } = verifyAccessToken(token);
    req.userId = sub;
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
}
