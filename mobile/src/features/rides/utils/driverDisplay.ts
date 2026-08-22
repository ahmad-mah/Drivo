import type { NearbyDriver } from "../types/ride.types";
import { DRIVER_DEFAULTS } from "../constants/driverDefaults";

/** Display helpers with fallbacks for optional driver fields. */

export function driverRating(driver: NearbyDriver): string {
  return driver.rating?.toFixed(1) ?? DRIVER_DEFAULTS.rating;
}

export function driverFare(driver: NearbyDriver): string {
  return driver.fare ?? DRIVER_DEFAULTS.fare;
}

export function driverSeats(driver: NearbyDriver): number {
  return driver.seats ?? DRIVER_DEFAULTS.seats;
}

export function driverEtaMinutes(driver: NearbyDriver): number {
  return driver.timeMinutes ?? DRIVER_DEFAULTS.etaMinutes;
}

export function driverVehicleLabel(driver: NearbyDriver): string {
  return `${driver.vehicleModel} • ${driver.vehicleColor}`;
}