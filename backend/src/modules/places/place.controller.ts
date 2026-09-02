import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/async-handler.js";
import * as placeService from "./place.service.js";

function optionalCoord(value: unknown): number | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * GET /api/places/autocomplete?q=...&lat=...&lng=...
 * Place suggestions for the ride destination field, biased to the rider.
 */
export const autocomplete = asyncHandler(
  async (req: Request, res: Response) => {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!query) {
      res.json({ success: true, data: [] });
      return;
    }

    const data = await placeService.searchPlaces(
      query,
      optionalCoord(req.query.lat),
      optionalCoord(req.query.lng),
    );
    res.json({ success: true, data });
  },
);