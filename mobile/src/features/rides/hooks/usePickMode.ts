import { useCallback, useState } from "react";
import { Keyboard, LayoutAnimation } from "react-native";
import type { PickField, RidePoint } from "../types/ride.types";
import { reverseGeocodeCoords } from "../utils/geocode";

/**
 * Map-pin picking mode: which form field the next map tap will fill. A tap
 * is reverse geocoded into an address and committed through
 * `applyPickedPoint`; tapping the active field's button again cancels.
 */
export function usePickMode(
  applyPickedPoint: (field: PickField, point: RidePoint) => void,
) {
  const [pickingField, setPickingField] = useState<PickField | null>(null);

  /** Reverse geocodes the tapped point and fills the picking field. */
  const handleMapPick = useCallback(
    async (latitude: number, longitude: number) => {
      const field = pickingField;
      if (!field) return;
      setPickingField(null);
      const address =
        (await reverseGeocodeCoords(latitude, longitude)) ?? "Dropped pin";
      applyPickedPoint(field, { address, latitude, longitude });
    },
    [pickingField, applyPickedPoint],
  );

  const handleRequestPickMap = useCallback((field: PickField) => {
    Keyboard.dismiss();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPickingField((current) => (current === field ? null : field));
  }, []);

  return { pickingField, handleMapPick, handleRequestPickMap };
}
