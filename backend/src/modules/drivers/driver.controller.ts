import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import * as driverService from "./driver.service";

/**
 * POST /api/drivers/apply
 * Submits a new driver application or re-applies after rejection.
 */
export async function apply(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = getAuth(req);
    const profile = await driverService.apply(userId!, req.body);
    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/drivers/my-application
 * Returns the authenticated user's driver application and status.
 */
export async function getMyApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = getAuth(req);
    const profile = await driverService.getMyApplication(userId!);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/drivers/my-application
 * Edits and re-submits a previously REJECTED application.
 */
export async function updateApplication(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = getAuth(req);
    const profile = await driverService.updateApplication(userId!, req.body);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}
