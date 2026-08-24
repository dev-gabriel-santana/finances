import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../errors';
import { logger } from '../logger';

interface ErrorWithIssues extends ApiError {
  issues?: { field: string; message: string }[];
}

// Express requires the 4-argument signature even when `next` is unused
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    const body: Record<string, unknown> = {
      error: err.code,
      message: err.message,
    };
    const typed = err as ErrorWithIssues;
    if (typed.issues) body['issues'] = typed.issues;
    return res.status(err.statusCode).json(body);
  }

  // Unknown error — log full details internally, expose nothing sensitive
  logger.error('Unhandled error', { err });
  return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Internal server error' });
}
