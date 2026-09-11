import { useCallback, useEffect, useRef, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import { RIDE_COMPLETED_EVENT } from "@/features/home/hooks/useRides";
import { useSnackbar } from "@/shared/contexts/SnackbarContext";
import { playMatch, playSoftAlert } from "@/shared/utils/sounds";
import { goBack } from "@/shared/services/navigation";
import { RidePhase } from "../utils/ridePhase";
import { SheetStep } from "../enums/SheetStep";
import type { NearbyDriver, RidePoint, Ride } from "../types/ride.types";

interface UseRideRequestActionsOptions {
  ridePhase: RidePhase;
  displayRide: Ride | null;
  endedMessage: string | null;
  setActiveSheet: (step: SheetStep) => void;
  handleRate: (stars: number, comment?: string) => Promise<void>;
  ratingSubmitting: boolean;
  resetForNewRide: () => void;
  submit: (
    origin: RidePoint,
    destination: RidePoint,
    preferredDriverId?: string,
  ) => Promise<unknown>;
  effectiveOrigin: RidePoint | null;
  effectiveDestination: RidePoint | null;
  selectedDriver: NearbyDriver | null;
  handlePickDriverFromList: (driver: NearbyDriver) => void;
  startFindNow: () => void;
  startFindNowRef: React.RefObject<(() => void) | null>;
}

/**
 * Owns the orchestration callbacks for the ride-request screen: phase→sheet
 * transitions, sounds, snackbar, confirm/rate/try-again/help actions.
 * Keeps the screen purely declarative.
 */
export function useRideRequestActions({
  ridePhase,
  endedMessage,
  setActiveSheet,
  handleRate,
  ratingSubmitting,
  resetForNewRide,
  submit,
  effectiveOrigin,
  effectiveDestination,
  selectedDriver,
  handlePickDriverFromList,
  startFindNow,
  startFindNowRef,
}: UseRideRequestActionsOptions) {
  const { show: showSnackbar } = useSnackbar();
  const [helpVisible, setHelpVisible] = useState(false);
  const endedSnackbarShownRef = useRef(false);
  const prevPhaseRef = useRef<RidePhase>(RidePhase.IDLE);

  // ridePhase → activeSheet + snackbar + sounds
  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = ridePhase;

    if (ridePhase === RidePhase.IDLE) {
      endedSnackbarShownRef.current = false;
      return;
    }

    if (ridePhase === RidePhase.SEARCHING) {
      endedSnackbarShownRef.current = false;
      setActiveSheet(SheetStep.SEARCHING);
    } else if (ridePhase === RidePhase.TRIP) {
      setActiveSheet(SheetStep.TRIP);
      if (prevPhase === RidePhase.SEARCHING) playMatch();
    } else if (ridePhase === RidePhase.ENDED) {
      setActiveSheet(SheetStep.DRIVERS);
      if (prevPhase === RidePhase.TRIP) playSoftAlert();
      if (endedMessage && !endedSnackbarShownRef.current) {
        endedSnackbarShownRef.current = true;
        showSnackbar(endedMessage);
      }
    }
  }, [ridePhase, endedMessage, setActiveSheet, showSnackbar]);

  // Sync startFindNow ref
  useEffect(() => {
    startFindNowRef.current = startFindNow;
  }, [startFindNow, startFindNowRef]);

  const handlePickAndShowInfo = useCallback(
    (driver: NearbyDriver) => {
      handlePickDriverFromList(driver);
      setActiveSheet(SheetStep.RIDE_INFO);
    },
    [handlePickDriverFromList, setActiveSheet],
  );

  const handleConfirmRide = useCallback(async () => {
    if (!effectiveOrigin || !effectiveDestination) return;
    resetForNewRide();
    try {
      await submit(effectiveOrigin, effectiveDestination, selectedDriver?.id);
      setActiveSheet(SheetStep.SEARCHING);
    } catch (err) {
      showSnackbar((err as Error).message || "Something went wrong");
    }
  }, [
    effectiveOrigin,
    effectiveDestination,
    selectedDriver,
    submit,
    setActiveSheet,
    resetForNewRide,
    showSnackbar,
  ]);

  const rateAndGoHome = useCallback(
    async (stars: number, comment?: string) => {
      await handleRate(stars, comment);
      DeviceEventEmitter.emit(RIDE_COMPLETED_EVENT);
      goBack();
    },
    [handleRate],
  );

  const handleTryAgain = useCallback(() => {
    setActiveSheet(SheetStep.FORM);
  }, [setActiveSheet]);

  const handleHelpReport = useCallback(() => {
    setHelpVisible(false);
    showSnackbar("Thank you for your report. We'll look into it.");
  }, [showSnackbar]);

  return {
    helpVisible,
    setHelpVisible,
    handlePickAndShowInfo,
    handleConfirmRide,
    rateAndGoHome,
    handleTryAgain,
    handleHelpReport,
    ratingSubmitting,
  };
}
