import { Router, type Request, type Response, type NextFunction } from 'express';
import { validate } from '../middleware/validate';
import { loginSchema, refreshSchema, registerSchema } from './schemas';
import * as authService from './service';

export const authRouter = Router();

authRouter.post(
  '/register',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokens = await authService.register(req.body, req.ip);
      res.status(201).json(tokens);
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post(
  '/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokens = await authService.login(req.body, req.ip, req.headers['user-agent']);
      res.json(tokens);
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post(
  '/refresh',
  validate(refreshSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokens = await authService.refresh(req.body.refreshToken);
      res.json(tokens);
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post(
  '/logout',
  validate(refreshSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await authService.logout(req.body.refreshToken);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
