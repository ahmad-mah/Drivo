import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
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
import { useRideRequestActions } from "../hooks/useRideRequestActions";
import { goBack } from "@/shared/services/navigation";

export function RideRequestScreen() {
  const { user } = useCurrentUser();

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

  // Dismiss cancel dialog if ride transitions to mid-trip while open
  useEffect(() => {
    if (isMidTrip) hideCancelConfirm();
  }, [isMidTrip, hideCancelConfirm]);

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

  const { submitting: confirmLoading, submit } = useRideRequest();
  const {
    startPostTripPayment,
    submitting: paymentSubmitting,
    paymentError,
  } = usePostTripPayment(
    displayRide?.status === RideStatus.TRIP_ENDED ? displayRide.id : null,
  );
  useErrorSnackbar(paymentError);
  const { route } = useDirections(effectiveOrigin, effectiveDestination);
  const { drivers, loading: driversLoading } = useNearbyDrivers(location);
  const { findNowLoading, startFindNow } = useFindNowFeedback(
    drivers.length,
    () => setActiveSheet(SheetStep.DRIVERS),
  );

  const {
    selectedDriver,
    focusedDriver,
    handleSelectDriver,
    handlePickDriverFromList,
  } = useDriverSelection(drivers);

  const { pickingField, handleMapPick, handleRequestPickMap } =
    usePickMode(applyPickedPoint);

  const {
    helpVisible,
    setHelpVisible,
    handlePickAndShowInfo,
    handleConfirmRide,
    rateAndGoHome,
    handleTryAgain,
    handleHelpReport,
  } = useRideRequestActions({
    ridePhase,
    displayRide,
    endedMessage,
    setActiveSheet,
    handleRate,
    ratingSubmitting,
    resetForNewRide,
    submit,
    effectiveOrigin,
    effectiveDestination,
    handlePickDriverFromList,
    startFindNow,
    startFindNowRef,
  });

  const {
    origin: rideOriginPoint,
    destination: rideDestinationPoint,
    route: rideRoute,
  } = useRideRoute(displayRide);

  const isSearchingOrTrip =
    activeSheet === SheetStep.SEARCHING || activeSheet === SheetStep.TRIP;

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
        visible={
          isSearchingOrTrip && ridePhase !== RidePhase.ENDED
        }
        connected={socketConnected}
      />

      <RideRequestHeader
        title={SHEET_TITLES[activeSheet]}
        onBack={stepsBack}
        hidden={isMidTrip}
      />

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
