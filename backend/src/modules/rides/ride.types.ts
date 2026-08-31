import type { RideStatus, RidePaymentStatus } from "@prisma/client";

export interface RidePoint {
  address: string;
  latitude: number;
  longitude: number;
}

export interface RequestRideDto {
  origin: RidePoint;
  destination: RidePoint;
}

/** Driver snapshot delivered to the rider when a ride is assigned. */
export interface AssignedDriverDto {
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
  etaMinutes?: number;
  seats?: number;
  carPlate?: string;
  imageUrl?: string;
}

/** Wire shape for a ride; fare is a string because Decimal serializes as one. */
export interface RideResponse {
  id: string;
  status: RideStatus;
  originAddress: string;
  originLatitude: number;
  originLongitude: number;
  destinationAddress: string;
  destinationLatitude: number;
  destinationLongitude: number;
  distanceKm: number;
  fare: string;
  currency: string;
  rideTimeMinutes: number;
  driverFirstName: string | null;
  driverLastName: string | null;
  nearbyDrivers: number;
  expiresAt: string;
  /**
   * Seconds until expiry measured from the server's clock at response time.
   * Clients must build their countdown from this relative value — comparing
   * the absolute `expiresAt` against a device clock breaks under skew.
   */
  expiresInSeconds: number;
  arrivedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelReason: string | null;
  seats: number | null;
  /** Average of ratings received by the assigned driver (null when unrated). */
  driverRating: number | null;
  /** Stars the requesting rider gave on a completed ride (null = not rated yet). */
  riderRating: number | null;
  /**
   * Only while ARRIVED: seconds until the driver may mark the rider a
   * no-show (relative — clients count down locally).
   */
  noShowInSeconds: number | null;
  /** Only while IN_PROGRESS: seconds since the trip started (relative). */
  tripElapsedSeconds: number | null;
  /** Payment status for the ride — PENDING, PAID, or FAILED. */
  paymentStatus: RidePaymentStatus | null;
  createdAt: string;
}