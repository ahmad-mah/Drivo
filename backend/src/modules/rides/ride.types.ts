import type { RideStatus } from "@prisma/client";

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
  createdAt: string;
}