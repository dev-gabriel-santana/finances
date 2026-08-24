import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './env';
import { authRouter } from './auth/routes';
import { usersRouter } from './users/routes';
import { errorHandler } from './middleware/errorHandler';
import { authLimiter } from './middleware/rateLimiter';
import { requireAuth } from './auth/middleware';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — locked to explicit origin(s) only
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  // Body parsing — small limit to prevent large-payload DoS
  app.use(express.json({ limit: '64kb' }));

  // Routes
  app.use('/auth', authLimiter, authRouter);
  app.use('/users', requireAuth, usersRouter);

  // Liveness probe — unauthenticated
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // Centralized error handler must be last
  app.use(errorHandler);

  return app;
}
