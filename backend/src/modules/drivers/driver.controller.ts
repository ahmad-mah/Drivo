import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { NEARBY_RADIUS_KM } from "../../config/index.js";
import { asyncHandler } from "../../middleware/async-handler.js";
import * as driverService from "./driver.service.js";

/**
 * POST /api/drivers/apply
 * Submits a new driver application or re-applies after rejection.
 */
export const apply = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const profile = await driverService.apply(userId!, req.body);
  res.status(201).json({ success: true, data: profile });
});

/**
 * GET /api/drivers/my-application
 * Returns the authenticated user's driver application and status.
 */
export const getMyApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const profile = await driverService.getMyApplication(userId!);
    res.json({ success: true, data: profile });
  },
);

/**
 * PUT /api/drivers/my-application
 * Edits and re-submits a previously REJECTED application.
 */
export const updateApplication = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const profile = await driverService.updateApplication(userId!, req.body);
    res.json({ success: true, data: profile });
  },
);

/**
 * PUT /api/drivers/availability
 * REST fallback for go online/offline when the socket is unavailable
 * (e.g. iOS background execution can't hold an open connection).
 */
export const updateAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const result = await driverService.setAvailability(userId!, req.body);
    res.json({ success: true, data: result });
  },
);

/**
 * POST /api/drivers/location
 * REST fallback for streaming a position when the socket is unavailable
 * (background tasks cannot reliably keep a WebSocket open).
 */
export const updateLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    await driverService.updateLocation(userId!, req.body);
    res.status(204).end();
  },
);

function optionalNumber(value: unknown, fallback?: number): number | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * GET /api/drivers/nearby?lat=&lng=&radiusKm=
 * Up to 6 nearest approved, online drivers for the rider's map.
 */
export const getNearbyDrivers = asyncHandler(
  async (req: Request, res: Response) => {
    const latitude = optionalNumber(req.query.lat);
    const longitude = optionalNumber(req.query.lng);
    const radiusKm = optionalNumber(req.query.radiusKm, NEARBY_RADIUS_KM) ?? NEARBY_RADIUS_KM;

    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({ success: false, message: "Missing coordinates." });
      return;
    }

    const data = await driverService.getNearbyDrivers(latitude, longitude, radiusKm);
    res.json({ success: true, data });
  },
);