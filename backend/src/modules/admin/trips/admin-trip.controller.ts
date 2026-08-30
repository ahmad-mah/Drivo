import type { Request, Response } from "express";
import { asyncHandler } from "../../../middleware/async-handler";
import * as adminTripService from "./admin-trip.service";
import type { RideStatus } from "@prisma/client";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminTripService.listTrips({
    status: req.query.status as RideStatus | undefined,
    dateFrom: req.query.dateFrom as string | undefined,
    dateTo: req.query.dateTo as string | undefined,
    search: req.query.search as string | undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });
  res.json({ success: true, data: result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const trip = await adminTripService.getTripDetail(id);
  res.json({ success: true, data: trip });
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { reason } = req.body;
  if (!reason || typeof reason !== "string") {
    res.status(400).json({ success: false, message: "Cancellation reason is required" });
    return;
  }
  const adminId = (req as any).adminUser?.id;
  const trip = await adminTripService.cancelTrip(id, adminId, reason);
  res.json({ success: true, data: trip });
});
