import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { ForbiddenError } from "../../errors/ForbiddenError.js";
import { UnauthorizedError } from "../../errors/UnauthorizedError.js";
import * as userRepository from "../users/user.repository.js";

/**
 * Middleware that blocks non-admin users from accessing admin-only routes.
 * Resolves the authenticated user from Clerk, looks up their DB role,
 * and rejects with 403 if role is not ADMIN.
 */
export async function ensureAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return next(new UnauthorizedError("Authentication required"));
    }

    const user = await userRepository.findByClerkId(userId);
    if (!user || user.role !== "ADMIN") {
      return next(new ForbiddenError("Admin access required"));
    }

    next();
  } catch (err) {
    next(err);
  }
}
