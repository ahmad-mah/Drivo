import { z } from "zod";
import { BadRequestError } from "../../errors/BadRequestError.js";

export const INVALID_LOCATION_MSG = "Invalid location coordinates";

/** Spread into zod object schemas for lat/lng fields. */
export const coordinatesShape = {
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
};

/**
 * Runtime validation for paths that bypass zod (e.g. socket payloads); the
 * guard's job is rejecting junk before it reaches the DB layer.
 */
export function assertValidCoordinates(
  latitude: unknown,
  longitude: unknown,
): void {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new BadRequestError(INVALID_LOCATION_MSG);
  }
}