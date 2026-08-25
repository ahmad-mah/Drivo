import type { CancellationReason } from "../enums/CancellationReason";
import type { RideStatus } from "../enums/RideStatus";

export interface RidePoint {
  address: string;
  latitude: number;
  longitude: number;
}

/** A point on the best driving-route polyline. */
export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

/** Which ride endpoint a map-pin pick will fill. */
export type PickField = "from" | "to";

export interface NearbyDriver {
  id: string;
  firstName: string;
  lastName: string;
  imageUrl: string | null;
  vehicleType: string;
  vehicleModel: string;
  vehicleColor: string;
  latitude: number;
  longitude: number;
  heading?: number;
  rating?: number;
  fare?: string;
  timeMinutes?: number;
  seats?: number;
  carPlate?: string;
  /**
   * Set by the nearby-drivers hook: false once the backend stops reporting
   * the driver (went offline / stale). Absent means online — server payloads
   * only ever contain online drivers.
   */
  isOnline?: boolean;
}

/** A destination suggestion returned by the Google Places proxy. */
export interface PlaceSuggestion {
  address: string;
  latitude: number;
  longitude: number;
}

/** Canonical ride shape returned by the backend. */
export interface Ride {
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
  driverVehicleType: string | null;
  driverVehicleModel: string | null;
  driverVehicleColor: string | null;
  driverLatitude: number | null;
  driverLongitude: number | null;
  driverHeading: number | null;
  driverRating: number | null;
  riderRating: number | null;
  seats: number | null;
  driverFare: number | null;
  driverEtaMinutes: number | null;
  driverSeats: number | null;
  driverCarPlate: string | null;
  driverImageUrl: string | null;
  nearbyDrivers: number;
  expiresAt: string;
  /** Server-computed seconds to expiry at response time — countdowns must be
   *  built from this locally; comparing expiresAt to the device clock breaks
   *  under clock skew. */
  expiresInSeconds: number;
  arrivedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelReason: CancellationReason | null;
  /** Only while ARRIVED: seconds until the driver may mark a no-show. */
  noShowInSeconds: number | null;
  /** Only while IN_PROGRESS: seconds since the trip started (relative). */
  tripElapsedSeconds: number | null;
  createdAt: string;
}
