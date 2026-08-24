import { useCallback, useEffect, useState } from "react";
import { BackHandler, LayoutAnimation } from "react-native";
import { goBack } from "@/shared/services/navigation";
import type { SheetStep } from "../constants/rideSheets";

/**
 * The ride-request sheet flow: form → drivers → ride-info. Forward navigation
 * is event-driven (Find now / Select Ride); back — hardware or header — walks
 * the steps in reverse and only then leaves the screen.
 */
export function useRideRequestSteps() {
  const [activeSheet, setActiveSheetState] = useState<SheetStep>("form");

  const setActiveSheet = useCallback((step: SheetStep) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveSheetState(step);
  }, []);

  const goToPreviousStep = useCallback(() => {
    if (activeSheet === "rideInfo") {
      setActiveSheet("drivers");
      return true;
    }
    if (activeSheet === "drivers") {
      setActiveSheet("form");
      return true;
    }
    return false;
  }, [activeSheet, setActiveSheet]);

  const handleBack = useCallback(() => {
    if (!goToPreviousStep()) goBack();
  }, [goToPreviousStep]);

  // Handle hardware back on Android without exiting the whole flow
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      goToPreviousStep,
    );
    return () => subscription.remove();
  }, [goToPreviousStep]);

  return { activeSheet, setActiveSheet, handleBack };
}
