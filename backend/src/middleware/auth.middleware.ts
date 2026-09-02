import { getAuth } from '@clerk/express';
import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const auth = getAuth(req);

  if (!auth.isAuthenticated) {
    return next(new UnauthorizedError('Authentication required'));
  }

  next();
}
