import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, View } from "react-native";
import { RIDE_COMPLETED_EVENT } from "@/features/home/hooks/useRides";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import { useSnackbar } from "@/shared/contexts/SnackbarContext";
import { RideBottomSheet } from "../components/RideBottomSheet";
import { RideConnectivityBanner } from "../components/RideConnectivityBanner";
import { RideRequestHeader } from "../components/RideRequestHeader";
import { RideRequestMap } from "../components/RideRequestMap";
import { CancelRideConfirmDialog } from "../components/CancelRideConfirmDialog";
import { TripHelpDialog } from "../components/TripHelpDialog";
import { RidePhase } from "../utils/ridePhase";
import { SheetStep } from "../enums/SheetStep";
import { RideStatus } from "../enums/RideStatus";
import { SHEET_TITLES } from "../constants/rideSheets";
import { useDirections } from "../hooks/useDirections";
import { useDriverSelection } from "../hooks/useDriverSelection";
import { useFindNowFeedback } from "../hooks/useFindNowFeedback";
import { useNearbyDrivers } from "../hooks/useNearbyDrivers";
import { usePickMode } from "../hooks/usePickMode";
import { useRideFormState } from "../hooks/useRideFormState";
import { useRideLifecycle } from "../hooks/useRideLifecycle";
import { useRideRequest } from "../hooks/useRideRequest";
import { useRideRoute } from "../hooks/useRideRoute";
import { useRideSteps } from "../hooks/useRideRequestSteps";
import { usePostTripPayment } from "../hooks/usePostTripPayment";
import { goBack } from "@/shared/services/navigation";
import type { NearbyDriver } from "../types/ride.types";

export function RideRequestScreen() {
  const { user } = useCurrentUser();
  const { show: showSnackbar } = useSnackbar();

  const {
    ridePhase,
    displayRide,
    activeRideLoading,
    cancelling,
    handleRate,
    ratingSubmitting,
    ratedLocally,
    endedMessage,
    socketConnected,
    expired,
    cancelConfirmVisible,
    showCancelConfirm,
    hideCancelConfirm,
    confirmCancel,
    resetForNewRide,
  } = useRideLifecycle();

  const isMidTrip =
    displayRide?.status === RideStatus.IN_PROGRESS ||
    displayRide?.status === RideStatus.TRIP_ENDED;

  const {
    activeSheet,
    setActiveSheet,
    handleBack: stepsBack,
  } = useRideSteps({
    showCancelConfirm,
    busy: cancelling || ratingSubmitting,
    midTrip: isMidTrip,
  });

  const [helpVisible, setHelpVisible] = useState(false);

  const endedSnackbarShownRef = useRef(false);

  // Single effect: ridePhase → activeSheet + snackbar
  useEffect(() => {
    if (ridePhase === RidePhase.IDLE) {
      endedSnackbarShownRef.current = false;
      return;
    }

    if (ridePhase === RidePhase.SEARCHING) {
      endedSnackbarShownRef.current = false;
      setActiveSheet(SheetStep.SEARCHING);
    } else if (ridePhase === RidePhase.TRIP) {
      setActiveSheet(SheetStep.TRIP);
    } else if (ridePhase === RidePhase.ENDED) {
      setActiveSheet(SheetStep.DRIVERS);
      if (endedMessage && !endedSnackbarShownRef.current) {
        endedSnackbarShownRef.current = true;
        showSnackbar(endedMessage);
      }
    }
  }, [ridePhase, endedMessage, setActiveSheet, showSnackbar]);

  // Dismiss the cancel dialog if the ride transitions to mid-trip while it is
  // still open (e.g. ARRIVED → IN_PROGRESS with stale dialog).
  useEffect(() => {
    if (isMidTrip) hideCancelConfirm();
  }, [isMidTrip, hideCancelConfirm]);

  // ── Form + ride request ────────────────────────────────────────
  const {
    location,
    effectiveOrigin,
    effectiveDestination,
    usingCurrentLocation,
    applyPickedPoint,
    formProps,
    findNowLoading: formFindNowLoading,
    startFindNowRef,
  } = useRideFormState();

  const { submitting: confirmLoading, submit, ride } = useRideRequest();
  const {
    startPostTripPayment,
    submitting: paymentSubmitting,
    paymentError,
    result: paymentResult,
  } = usePostTripPayment(displayRide?.status === RideStatus.TRIP_ENDED ? displayRide.id : null);
  useErrorSnackbar(paymentError);
  const { route } = useDirections(effectiveOrigin, effectiveDestination);
  const { drivers, loading: driversLoading } = useNearbyDrivers(location);
  const { findNowLoading, startFindNow } = useFindNowFeedback(
    drivers.length,
    () => setActiveSheet(SheetStep.DRIVERS),
  );
  useEffect(() => {
    startFindNowRef.current = startFindNow;
  }, [startFindNow, startFindNowRef]);

  const {
    selectedDriver,
    focusedDriver,
    handleSelectDriver,
    handlePickDriverFromList,
  } = useDriverSelection(drivers);

  const { pickingField, handleMapPick, handleRequestPickMap } =
    usePickMode(applyPickedPoint);

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
      await submit(effectiveOrigin, effectiveDestination);
      setActiveSheet(SheetStep.SEARCHING);
    } catch (err) {
      showSnackbar((err as Error).message || "Something went wrong");
    }
  }, [effectiveOrigin, effectiveDestination, submit, setActiveSheet, resetForNewRide]);

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

  const {
    origin: rideOriginPoint,
    destination: rideDestinationPoint,
    route: rideRoute,
  } = useRideRoute(displayRide);

  const isSearchingOrTrip =
    activeSheet === SheetStep.SEARCHING || activeSheet === SheetStep.TRIP;

  const showConnectivityBanner =
    isSearchingOrTrip && ridePhase !== RidePhase.ENDED;

  return (
    <View className="flex-1">
      <View className="absolute inset-0">
        <RideRequestMap
          location={location}
          origin={isSearchingOrTrip ? rideOriginPoint : effectiveOrigin}
          destination={
            isSearchingOrTrip ? rideDestinationPoint : effectiveDestination
          }
          route={isSearchingOrTrip ? rideRoute : route}
          drivers={drivers}
          originIsCurrentLocation={usingCurrentLocation && !pickingField}
          selectedDriverId={selectedDriver?.id ?? null}
          focusedDriver={focusedDriver}
          onSelectDriver={handleSelectDriver}
          userImageUrl={user?.imageUrl}
          userName={user?.firstName}
          pickingField={activeSheet === SheetStep.FORM ? pickingField : null}
          onMapPick={(lat, lng) => void handleMapPick(lat, lng)}
        />
      </View>

      <RideConnectivityBanner
        visible={showConnectivityBanner}
        connected={socketConnected}
      />

      <RideRequestHeader title={SHEET_TITLES[activeSheet]} onBack={stepsBack} hidden={isMidTrip} />

      {activeRideLoading && (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator />
        </View>
      )}

      <RideBottomSheet
        activeSheet={activeSheet}
        busy={cancelling || ratingSubmitting || paymentSubmitting}
        formProps={formProps}
        findNowLoading={findNowLoading || formFindNowLoading}
        pickingField={pickingField}
        onRequestPickMap={handleRequestPickMap}
        drivers={drivers}
        driversLoading={driversLoading}
        expired={expired}
        onPickDriverFromList={handlePickAndShowInfo}
        onTryAgain={handleTryAgain}
        selectedDriver={selectedDriver}
        effectiveOrigin={effectiveOrigin}
        effectiveDestination={effectiveDestination}
        onConfirmRide={handleConfirmRide}
        confirmLoading={confirmLoading}
        displayRide={displayRide}
        onRequestCancel={showCancelConfirm}
        cancelling={cancelling}
        onRequestHelp={() => setHelpVisible(true)}
        onRate={rateAndGoHome}
        ratingSubmitting={ratingSubmitting}
        alreadyRated={ratedLocally}
        onDone={goBack}
        onPay={startPostTripPayment}
        paying={paymentSubmitting}
      />

      <CancelRideConfirmDialog
        visible={cancelConfirmVisible}
        variant={isMidTrip ? "mid-trip" : "pre-trip"}
        onConfirm={confirmCancel}
        onDismiss={hideCancelConfirm}
        loading={cancelling}
      />

      <TripHelpDialog
        visible={helpVisible}
        onReport={handleHelpReport}
        onClose={() => setHelpVisible(false)}
      />
    </View>
  );
}
