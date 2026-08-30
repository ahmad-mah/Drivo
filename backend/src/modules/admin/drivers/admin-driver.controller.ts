import type { Request, Response } from "express";
import type { ApprovalStatus } from "@prisma/client";
import { asyncHandler } from "../../../middleware/async-handler";
import * as adminDriverService from "./admin-driver.service";

/**
 * GET /api/admin/drivers
 * Lists all driver profiles. Optional ?status=PENDING|APPROVED|REJECTED|SUSPENDED filter.
 */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as ApprovalStatus | undefined;
  const drivers = await adminDriverService.listDrivers(status);
  res.json({ success: true, data: drivers });
});

/**
 * GET /api/admin/drivers/live
 * Returns drivers currently online with their latest positions, for the admin
 * live map. Admin only.
 */
export const listLive = asyncHandler(async (req: Request, res: Response) => {
  const drivers = await adminDriverService.listLiveDrivers();
  res.json({ success: true, data: drivers });
});

/**
 * GET /api/admin/drivers/:id
 * Returns a single driver profile. Admin only.
 */
export const getById = asyncHandler(async (req: Request, res: Response) => {
  const profile = await adminDriverService.getById(req.params.id as string);
  res.json({ success: true, data: profile });
});

/**
 * GET /api/admin/drivers/:id/detail
 * Returns full driver detail: profile, stats, documents, recent trips.
 */
export const getDetail = asyncHandler(async (req: Request, res: Response) => {
  const detail = await adminDriverService.getDetail(req.params.id as string);
  res.json({ success: true, data: detail });
});

/**
 * PUT /api/admin/drivers/:id/approve
 * Approves a PENDING driver application. Admin only.
 */
export const approve = asyncHandler(async (req: Request, res: Response) => {
  const profile = await adminDriverService.approve(req.params.id as string);
  res.json({ success: true, data: profile });
});

/**
 * PUT /api/admin/drivers/:id/reject
 * Rejects a PENDING driver application. Requires a rejection reason in the body.
 * Admin only.
 */
export const reject = asyncHandler(async (req: Request, res: Response) => {
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
});

/**
 * PUT /api/admin/drivers/:id/suspend
 * Suspends an APPROVED driver. Admin only.
 */
export const suspend = asyncHandler(async (req: Request, res: Response) => {
  const profile = await adminDriverService.suspend(req.params.id as string);
  res.json({ success: true, data: profile });
});

/**
 * PUT /api/admin/drivers/:id/reinstate
 * Reinstates a SUSPENDED driver back to APPROVED. Admin only.
 */
export const reinstate = asyncHandler(async (req: Request, res: Response) => {
  const profile = await adminDriverService.reinstate(req.params.id as string);
  res.json({ success: true, data: profile });
});