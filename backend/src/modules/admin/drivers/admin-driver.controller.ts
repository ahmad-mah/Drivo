import type { Request, Response, NextFunction } from "express";
import type { ApprovalStatus } from "@prisma/client";
import * as adminDriverService from "./admin-driver.service";

/**
 * GET /api/admin/drivers
 * Lists all driver profiles. Optional ?status=PENDING|APPROVED|REJECTED|SUSPENDED filter.
 */
export async function list(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const status = req.query.status as ApprovalStatus | undefined;
    const drivers = await adminDriverService.listDrivers(status);
    res.json({ success: true, data: drivers });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/drivers/:id/approve
 * Approves a PENDING driver application. Admin only.
 */
export async function approve(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await adminDriverService.approve(req.params.id as string);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/drivers/:id/reject
 * Rejects a PENDING driver application. Requires a rejection reason in the body.
 * Admin only.
 */
export async function reject(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { reason } = req.body;
    if (!reason || typeof reason !== "string") {
      res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
      return;
    }
    const profile = await adminDriverService.reject(req.params.id as string, reason);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/drivers/:id/suspend
 * Suspends an APPROVED driver. Admin only.
 */
export async function suspend(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await adminDriverService.suspend(req.params.id as string);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/drivers/:id/reinstate
 * Reinstates a SUSPENDED driver back to APPROVED. Admin only.
 */
export async function reinstate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const profile = await adminDriverService.reinstate(req.params.id as string);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
}
