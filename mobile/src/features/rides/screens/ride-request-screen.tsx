import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useKeyboardHeight } from "@/shared/hooks/useKeyboardHeight";
import { NearbyDriversSheet } from "../components/NearbyDriversSheet";
import { RideInfoSheet } from "../components/RideInfoSheet";
import { RideRequestForm } from "../components/RideRequestForm";
import { RideRequestHeader } from "../components/RideRequestHeader";
import { RideRequestMap } from "../components/RideRequestMap";
import { SHEET_TITLES } from "../constants/rideSheets";
import { useDirections } from "../hooks/useDirections";
import { useDriverSelection } from "../hooks/useDriverSelection";
import { useFindNowFeedback } from "../hooks/useFindNowFeedback";
import { useNearbyDrivers } from "../hooks/useNearbyDrivers";
import { usePickMode } from "../hooks/usePickMode";
import { useRideRequest } from "../hooks/useRideRequest";
import { useRideRequestForm } from "../hooks/useRideRequestForm";
import { useRideRequestSteps } from "../hooks/useRideRequestSteps";
import type { PlaceSuggestion, RidePoint } from "../types/ride.types";

export function RideRequestScreen() {
  // Cached ride points after "Find now" — they pin the map/route to what was
  // searched even as the user keeps typing underneath.
  const [rideOrigin, setRideOrigin] = useState<RidePoint | null>(null);
  const [rideDestination, setRideDestination] = useState<RidePoint | null>(null);
  const keyboardHeight = useKeyboardHeight();
  const { user } = useCurrentUser();

  const { activeSheet, setActiveSheet, handleBack } = useRideRequestSteps();

  const { submitting: confirmLoading, submit } = useRideRequest();

  // The form's success callback fires before the feedback hook exists below
  // (it needs the driver count, which needs the form's location), so the
  // starter is delivered through a ref instead of hook-order gymnastics.
  const startFindNowRef = useRef<() => void>(() => {});

  const {
    location,
    origin: formOrigin,
    destination: formDestination,
    usingCurrentLocation,
    applyPickedPoint,
    ...formProps
  } = useRideRequestForm({
    onFindNowSuccess: (origin, destination) => {
      setRideOrigin(origin);
      setRideDestination(destination);
      startFindNowRef.current();
    },
  });

  const effectiveOrigin = rideOrigin ?? formOrigin;
  const effectiveDestination = rideDestination ?? formDestination;

  // Editing the form after "Find now" invalidates the cached ride points so the
  // map re-renders the newly picked/typed location instead of the stale route.
  const resetRidePoints = useCallback(() => {
    setRideOrigin(null);
    setRideDestination(null);
  }, []);

  const formPropsWithReset = {
    ...formProps,
    onChangeFrom: (text: string) => {
      formProps.onChangeFrom(text);
      resetRidePoints();
    },
    onChangeTo: (text: string) => {
      formProps.onChangeTo(text);
      resetRidePoints();
    },
    onSelectFromSuggestion: (suggestion: PlaceSuggestion) => {
      formProps.onSelectFromSuggestion(suggestion);
      resetRidePoints();
    },
    onSelectSuggestion: (suggestion: PlaceSuggestion) => {
      formProps.onSelectSuggestion(suggestion);
      resetRidePoints();
    },
    onUseCurrentLocation: () => {
      void formProps.onUseCurrentLocation();
      resetRidePoints();
    },
  };

  const { route } = useDirections(effectiveOrigin, effectiveDestination);
  const { drivers, loading: driversLoading } = useNearbyDrivers(location);
  const { findNowLoading, startFindNow } = useFindNowFeedback(
    drivers.length,
    () => setActiveSheet("drivers"),
  );
  useEffect(() => {
    startFindNowRef.current = startFindNow;
  }, [startFindNow]);

  const {
    selectedDriver,
    focusedDriver,
    handleSelectDriver,
    handlePickDriverFromList,
  } = useDriverSelection(drivers);

  const { pickingField, handleMapPick, handleRequestPickMap } =
    usePickMode(applyPickedPoint);

  const handleSelectRide = useCallback(() => {
    if (selectedDriver) {
      setActiveSheet("rideInfo");
    }
  }, [selectedDriver, setActiveSheet]);

  const handleConfirmRide = useCallback(async () => {
    const origin = effectiveOrigin;
    const destination = effectiveDestination;

    if (!origin || !destination) return;

    await submit(origin, destination);
  }, [effectiveOrigin, effectiveDestination, submit]);

  const headerTitle = SHEET_TITLES[activeSheet];

  return (
    <View className="flex-1">
      {/* Full-screen map behind the sheet stack */}
      <View className="absolute inset-0">
        <RideRequestMap
          location={location}
          origin={effectiveOrigin}
          destination={effectiveDestination}
          route={route}
          drivers={drivers}
          originIsCurrentLocation={usingCurrentLocation && !pickingField}
          selectedDriverId={selectedDriver?.id ?? null}
          focusedDriver={focusedDriver}
          onSelectDriver={handleSelectDriver}
          userImageUrl={user?.imageUrl}
          userName={user?.firstName}
          pickingField={activeSheet === "form" ? pickingField : null}
          onMapPick={(latitude, longitude) =>
            void handleMapPick(latitude, longitude)
          }
        />
      </View>

      {/* Floating Header */}
      <RideRequestHeader title={headerTitle} onBack={handleBack} />

      {/* Bottom sheet overlay. The ride-info step sizes to its content so all
          details fit without scrolling; the other steps keep a fixed height.
          The form step lifts by the exact keyboard height (see
          useKeyboardHeight — resize mode is dead under edge-to-edge). */}
      <View
        className={`absolute inset-x-0 bottom-0 justify-end ${
          activeSheet === "rideInfo" ? "max-h-[92%]" : "h-[60%]"
        }`}
        style={
          activeSheet === "form" ? { paddingBottom: keyboardHeight } : undefined
        }
      >
        {activeSheet === "form" && (
          <RideRequestForm
            {...formPropsWithReset}
            findNowLoading={findNowLoading || formProps.findNowLoading}
            pickingField={pickingField}
            onRequestPickMap={handleRequestPickMap}
          />
        )}

        {activeSheet === "drivers" && (
          <NearbyDriversSheet
            drivers={drivers}
            loading={driversLoading}
            selectedDriverId={selectedDriver?.id ?? null}
            onSelectDriver={handlePickDriverFromList}
            onSelectRide={handleSelectRide}
          />
        )}

        {activeSheet === "rideInfo" && selectedDriver && (
          <RideInfoSheet
            driver={selectedDriver}
            origin={effectiveOrigin}
            destination={effectiveDestination}
            onConfirm={handleConfirmRide}
            confirmLoading={confirmLoading}
          />
        )}
      </View>
    </View>
  );
}
