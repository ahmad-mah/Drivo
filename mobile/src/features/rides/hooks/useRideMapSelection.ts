import { useCallback, useRef, useState } from "react";
import type { NearbyDriver } from "../types/ride.types";

interface UseRideMapSelectionOptions {
  controlledSelectedDriverId?: string | null;
  onSelectDriver?: (driver: NearbyDriver | null) => void;
}

/**
 * Selection state for the ride-request map: the focused driver (controlled or
 * internal), whether the rider themselves is selected, and the press handlers.
 * Marker presses always win over the map's onPress (iOS bubbles both).
 */
export function useRideMapSelection({
  controlledSelectedDriverId,
  onSelectDriver,
}: UseRideMapSelectionOptions) {
  const [internalSelectedDriverId, setInternalSelectedDriverId] = useState<string | null>(
    null,
  );
  const [selectedSelf, setSelectedSelf] = useState(false);

  const selectedDriverId =
    controlledSelectedDriverId !== undefined
      ? controlledSelectedDriverId
      : internalSelectedDriverId;

  // Self indicator is only expanded when self is selected AND no driver is selected
  const isSelfSelected = selectedSelf && !selectedDriverId;

  // Marker presses also bubble to the map's onPress on iOS; the guard lets the
  // marker handler win and ignores the trailing map press.
  const isMarkerPressedRef = useRef(false);

  const noteMarkerTap = useCallback(() => {
    isMarkerPressedRef.current = true;
    setTimeout(() => {
      isMarkerPressedRef.current = false;
    }, 400);
  }, []);

  const handleMapPress = useCallback(() => {
    if (isMarkerPressedRef.current) return;
    setSelectedSelf(false);
    setInternalSelectedDriverId(null);
    onSelectDriver?.(null);
  }, [onSelectDriver]);

  const handleDriverPress = useCallback(
    (driver: NearbyDriver) => {
      noteMarkerTap();
      if (selectedDriverId === driver.id) {
        setInternalSelectedDriverId(null);
        onSelectDriver?.(null);
      } else {
        setSelectedSelf(false);
        setInternalSelectedDriverId(driver.id);
        onSelectDriver?.(driver);
      }
    },
    [noteMarkerTap, onSelectDriver, selectedDriverId],
  );

  const handleSelfPress = useCallback(() => {
    noteMarkerTap();
    const next = !isSelfSelected;
    setSelectedSelf(next);
    if (next) {
      setInternalSelectedDriverId(null);
      onSelectDriver?.(null);
    }
  }, [isSelfSelected, noteMarkerTap, onSelectDriver]);

  return {
    selectedDriverId,
    isSelfSelected,
    handleMapPress,
    handleDriverPress,
    handleSelfPress,
  };
}