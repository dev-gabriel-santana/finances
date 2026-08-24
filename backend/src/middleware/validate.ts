import type { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { ApiError } from '../errors';

/** Validates `req.body` against a Zod schema in strict (strip) mode. */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      next(ApiError.badRequest('Validation failed', 'VALIDATION_ERROR'));
      // Attach issues without leaking internal schema details
      (next as unknown as (e: unknown) => void)(
        Object.assign(ApiError.badRequest('Validation failed', 'VALIDATION_ERROR'), { issues }),
      );
      return;
    }
    req.body = result.data as unknown;
    next();
  };
}
