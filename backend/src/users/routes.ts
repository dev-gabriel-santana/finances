import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../db';
import { decrypt } from '../crypto';
import { env } from '../env';
import { ApiError } from '../errors';

export const usersRouter = Router();

/** GET /users/me — returns the authenticated user's profile. */
usersRouter.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, createdAt: true },
    });

    if (!user || !req.userId) return next(ApiError.notFound('User not found'));

    res.json({
      id: user.id,
      email: decrypt(user.email, env.FIELD_ENCRYPTION_KEY),
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
});
