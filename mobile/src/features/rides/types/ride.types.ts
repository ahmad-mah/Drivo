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
  driverFare: number | null;
  driverEtaMinutes: number | null;
  driverSeats: number | null;
  driverCarPlate: string | null;
  driverImageUrl: string | null;
  nearbyDrivers: number;
  expiresAt: string;
  createdAt: string;
}
