import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { asyncHandler } from "../../middleware/async-handler.js";
import * as rideService from "./ride.service.js";

/**
 * POST /api/rides/request
 * Creates a pending ride; 409 while the user already has an active one.
 */
export const request = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const ride = await rideService.requestRide(userId!, req.body);
  res.status(201).json({ success: true, data: ride });
});

/**
 * GET /api/rides/me/active
 * Poll target for the rider's searching screen.
 */
export const getActive = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const ride = await rideService.getActiveRide(userId!);
  res.json({ success: true, data: ride });
});

/**
 * DELETE /api/rides/:id/cancel
 * Rider cancels a ride before it starts; 409 once the trip is underway.
 */
export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const ride = await rideService.cancelRide(userId!, req.params.id as string);
  res.json({ success: true, data: ride });
});

/**
 * GET /api/rides/recent
 * The rider's completed ride history for the home screen.
 */
/** GET /api/rides/recent?limit=3 — home preview (few latest rides). */
export const getRecent = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const limit = Math.min(Number(req.query.limit) || 3, 10);
  const rides = await rideService.getRecentRides(userId!, limit);
  res.json({ success: true, data: rides });
});

/** GET /api/rides/history?offset=0&limit=20 — the full paginated list. */
export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Math.max(Number(req.query.offset) || 0, 0);
  const rides = await rideService.getRideHistory(userId!, limit, offset);
  res.json({ success: true, data: rides });
});

/**
 * POST /api/rides/:id/accept
 * Driver accepts a dispatched request; 409 when the offer or ride already resolved.
 */
export const accept = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const ride = await rideService.acceptRideRequest(userId!, req.params.id as string);
  res.json({ success: true, data: ride });
});

/**
 * POST /api/rides/:id/reject
 * Driver declines a dispatched request; the dispatcher escalates to the next candidate.
 */
export const reject = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  await rideService.rejectRideRequest(userId!, req.params.id as string);
  res.json({ success: true });
});

/** GET /api/rides/driver/active — restore path for restarts/reconnects. */
export const getDriverActive = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const ride = await rideService.getDriverActiveRide(userId!);
  res.json({ success: true, data: ride });
});

/** POST /api/rides/:id/arrive — ACCEPTED → ARRIVED. */
export const arrive = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const ride = await rideService.arriveAtPickup(userId!, req.params.id as string);
  res.json({ success: true, data: ride });
});

/** POST /api/rides/:id/start — ARRIVED → IN_PROGRESS. */
export const start = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const ride = await rideService.startTrip(userId!, req.params.id as string);
  res.json({ success: true, data: ride });
});

/** POST /api/rides/:id/arrived-at-destination — IN_PROGRESS → TRIP_ENDED. */
export const arrivedAtDestination = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const ride = await rideService.arrivedAtDestination(userId!, req.params.id as string);
  res.json({ success: true, data: ride });
});

/** POST /api/rides/:id/complete — TRIP_ENDED → COMPLETED (requires PAID). */
export const complete = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const ride = await rideService.completeTrip(userId!, req.params.id as string);
  res.json({ success: true, data: ride });
});

/** POST /api/rides/:id/no-show — ARRIVED → CANCELLED (rider never showed). */
export const noShow = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const ride = await rideService.markRiderNoShow(userId!, req.params.id as string);
  res.json({ success: true, data: ride });
});

/** POST /api/rides/:id/driver-cancel — pre-trip re-dispatch / mid-trip abort. */
export const driverCancel = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const ride = await rideService.cancelTripAsDriver(
    userId!,
    req.params.id as string,
  );
  res.json({ success: true, data: ride });
});

/**
 * POST /api/rides/:id/rate
 * Rider rates the driver on a completed ride (stars 1–5 + optional comment).
 */
export const rate = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const ride = await rideService.rateRide(
    userId!,
    req.params.id as string,
    req.body as { stars: number; comment?: string },
  );
  res.json({ success: true, data: ride });
});