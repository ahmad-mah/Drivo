import { useCallback, useState } from "react";
import type { PickField, RidePoint } from "../types/ride.types";

/**
 * Map-pin picks for the ride-request form. Autocomplete coverage is limited,
 * so a pin on the map is the fallback entry point for both ends; any manual
 * edit or suggestion selection clears the pick it belongs to.
 */
export function usePickedRidePoints() {
  const [pickedFrom, setPickedFrom] = useState<RidePoint | null>(null);
  const [pickedTo, setPickedTo] = useState<RidePoint | null>(null);

  /** Commits a map-pin pick for one of the two fields. Filling the field's
   *  text is the form hook's job — it owns the text state. */
  const applyPickedPoint = useCallback(
    (field: PickField, point: RidePoint) => {
      if (field === "from") setPickedFrom(point);
      else setPickedTo(point);
    },
    [],
  );

  return {
    pickedFrom,
    pickedTo,
    clearPickedFrom: useCallback(() => setPickedFrom(null), []),
    clearPickedTo: useCallback(() => setPickedTo(null), []),
    applyPickedPoint,
  };
}
