import { useCallback, useEffect, useState } from "react";
import { BackHandler, LayoutAnimation } from "react-native";
import { goBack } from "@/shared/services/navigation";
import { SheetStep } from "../enums/SheetStep";

interface UseRideStepsOptions {
  /** Opens the cancel confirmation dialog when back is pressed during searching/trip. */
  showCancelConfirm?: () => void;
  /** Whether an action is currently in flight (disables back to prevent double-action). */
  busy?: boolean;
  /** When true, back is fully blocked during the TRIP phase — no cancel dialog, no navigation. */
  midTrip?: boolean;
}

/**
 * Manages the 5-step ride sheet flow: form → drivers → rideInfo → searching → trip.
 *
 * Back navigation opens cancel confirmation during searching/trip:
 * - trip → (cancel confirm) → stays on trip
 * - searching → (cancel confirm) → stays on searching
 * - rideInfo → drivers
 * - drivers → form
 * - form → exit (goBack to Home)
 */
export function useRideSteps({
  showCancelConfirm,
  busy = false,
  midTrip = false,
}: UseRideStepsOptions = {}) {
  const [activeSheet, setActiveSheetState] = useState<SheetStep>(SheetStep.FORM);

  const setActiveSheet = useCallback((step: SheetStep) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveSheetState(step);
  }, []);

  const goToPreviousStep = useCallback(() => {
    if (busy) return true;

    if (activeSheet === SheetStep.TRIP) {
      if (midTrip) return true;
      showCancelConfirm?.();
      return true;
    }
    if (activeSheet === SheetStep.SEARCHING) {
      showCancelConfirm?.();
      return true;
    }
    if (activeSheet === SheetStep.RIDE_INFO) {
      setActiveSheet(SheetStep.DRIVERS);
      return true;
    }
    if (activeSheet === SheetStep.DRIVERS) {
      setActiveSheet(SheetStep.FORM);
      return true;
    }
    return false;
  }, [activeSheet, setActiveSheet, showCancelConfirm, busy, midTrip]);

  const handleBack = useCallback(() => {
    if (!goToPreviousStep()) goBack();
  }, [goToPreviousStep]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      goToPreviousStep,
    );
    return () => subscription.remove();
  }, [goToPreviousStep]);

  return { activeSheet, setActiveSheet, handleBack };
}
