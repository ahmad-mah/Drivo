import { getSocketServer } from "../../sockets/ride";

/** Ride summary pushed to a driver when they are dispatched a request. */
export interface IncomingRideRequest {
  rideId: string;
  originAddress: string;
  originLatitude: number;
  originLongitude: number;
  destinationAddress: string;
  destinationLatitude: number;
  destinationLongitude: number;
  tripDistanceKm: number;
  fare: number;
  currency: string;
  /** Estimated minutes for the driver to reach the pickup point. */
  etaMinutes: number;
  /**
   * Response window in seconds, relative to receipt. Clients must derive
   * their deadline locally — an absolute epoch breaks under device clock skew.
   */
  respondWithinSeconds: number;
}

export async function notifyRideRequested(
  clerkId: string,
  rideId: string,
  nearbyDriversCount: number,
) {
  const io = getSocketServer();
  if (!io) return;
  io.to(clerkId).emit("ride:requested", { rideId, nearbyDriversCount });
}

/** Authoritative expiry signal — riders must not predict expiry from their own clock. */
export async function notifyRideExpired(clerkId: string, rideId: string) {
  const io = getSocketServer();
  if (!io) return;
  io.to(clerkId).emit("ride:expired", { rideId });
}

/**
 * Generic lifecycle broadcast: every trip transition (accept/cancel/
 * arrive/start/complete) lands here for both the rider's and the driver's
 * rooms. Clients refetch their active ride on receipt.
 */
export async function notifyRideUpdated(clerkIds: string[], rideId: string) {
  const io = getSocketServer();
  if (!io) return;
  for (const clerkId of clerkIds) {
    io.to(clerkId).emit("ride:updated", { rideId });
  }
}

export async function notifyNewRideRequest(
  clerkId: string,
  payload: IncomingRideRequest,
) {
  const io = getSocketServer();
  if (!io) return;
  io.to(clerkId).emit("ride:new-request", payload);
}

export async function notifyDriverAssigned(
  clerkId: string,
  rideId: string,
  driver: {
    id: string;
    firstName: string;
    lastName: string;
    vehicleType: string;
    vehicleModel: string;
    vehicleColor: string;
    latitude: number;
    longitude: number;
    heading?: number;
    rating?: number;
    fare?: number;
    timeMinutes?: number;
    seats?: number;
    carPlate?: string;
    imageUrl?: string;
  },
) {
  const io = getSocketServer();
  if (!io) return;
  io.to(clerkId).emit("driver:assigned", { rideId, driver });
}
