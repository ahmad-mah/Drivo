import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/async-handler";
import * as directionsService from "./directions.service";

function coord(value: unknown): number | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * GET /api/directions?fromLat=&fromLng=&toLat=&toLng=
 * Best driving-route polyline between two picked places.
 */
export const getDirections = asyncHandler(
  async (req: Request, res: Response) => {
    const fromLat = coord(req.query.fromLat);
    const fromLng = coord(req.query.fromLng);
    const toLat = coord(req.query.toLat);
    const toLng = coord(req.query.toLng);

    if (
      fromLat === undefined ||
      fromLng === undefined ||
      toLat === undefined ||
      toLng === undefined
    ) {
      res.status(400).json({ success: false, message: "Invalid coordinates." });
      return;
    }

    const data = await directionsService.getRoute(fromLat, fromLng, toLat, toLng);
    res.json({ success: true, data });
  },
);

/**
 * GET /api/directions/eta?fromLat=&fromLng=&toLat=&toLng=
 * Driving ETA in minutes between two points — used for live trip ETAs.
 */
export const getEta = asyncHandler(async (req: Request, res: Response) => {
  const fromLat = coord(req.query.fromLat);
  const fromLng = coord(req.query.fromLng);
  const toLat = coord(req.query.toLat);
  const toLng = coord(req.query.toLng);

  if (
    fromLat === undefined ||
    fromLng === undefined ||
    toLat === undefined ||
    toLng === undefined
  ) {
    res.status(400).json({ success: false, message: "Invalid coordinates." });
    return;
  }

  const durationMinutes = await directionsService.getRouteDuration(
    fromLat,
    fromLng,
    toLat,
    toLng,
  );
  res.json({ success: true, data: { durationMinutes } });
});
