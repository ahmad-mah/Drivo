import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { asyncHandler } from "../../middleware/async-handler";
import * as rideService from "./ride.service";

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
 * Cancels a ride while it is still pending; 409 once accepted/expired.
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
export const getRecent = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  const rides = await rideService.getRecentRides(userId!);
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