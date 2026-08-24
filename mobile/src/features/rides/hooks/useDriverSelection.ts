import { useCallback, useState } from "react";
import type { NearbyDriver } from "../types/ride.types";

/**
 * Owns driver selection for the ride-request flow: the picked driver (from
 * map marker or sheet list) and the map focus target.
 *
 * A picked driver going offline invalidates the pick — derived during render
 * rather than cleared from an effect, so the reset is instant and never
 * cascades renders.
 */
export function useDriverSelection(drivers: NearbyDriver[]) {
  const [pickedDriver, setPickedDriver] = useState<NearbyDriver | null>(null);
  const [focusedDriver, setFocusedDriver] = useState<NearbyDriver | null>(null);

  const pickedDriverIsOffline =
    pickedDriver !== null &&
    drivers.find((driver) => driver.id === pickedDriver.id)?.isOnline === false;

  const selectedDriver = pickedDriverIsOffline ? null : pickedDriver;

  const handleSelectDriver = useCallback((driver: NearbyDriver | null) => {
    setPickedDriver(driver);
  }, []);

  // Picking from the sheet list also tells the map to pan to that driver.
  const handlePickDriverFromList = useCallback((driver: NearbyDriver) => {
    setPickedDriver(driver);
    setFocusedDriver(driver);
  }, []);

  return {
    selectedDriver,
    focusedDriver,
    handleSelectDriver,
    handlePickDriverFromList,
  };
}
