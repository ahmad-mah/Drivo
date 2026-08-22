import { useCallback, useEffect, useState } from "react";
import { BackHandler, LayoutAnimation, Platform, UIManager, View } from "react-native";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { goBack } from "@/shared/services/navigation";
import { NearbyDriversSheet } from "../components/NearbyDriversSheet";
import { RideInfoSheet } from "../components/RideInfoSheet";
import { RideRequestForm } from "../components/RideRequestForm";
import { RideRequestHeader } from "../components/RideRequestHeader";
import { RideRequestMap } from "../components/RideRequestMap";
import { SHEET_TITLES, type SheetStep } from "../constants/rideSheets";
import { useDirections } from "../hooks/useDirections";
import { useNearbyDrivers } from "../hooks/useNearbyDrivers";
import { useRideRequest } from "../hooks/useRideRequest";
import { useRideRequestForm } from "../hooks/useRideRequestForm";
import type { NearbyDriver, PlaceSuggestion, RidePoint } from "../types/ride.types";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Visible loading duration on the Find button once drivers are ready, and the
// fallback so an empty search never leaves the spinner spinning forever.
const FIND_NOW_SEARCH_MS = 1200;
const FIND_NOW_MAX_MS = 3000;

export function RideRequestScreen() {
  const [activeSheet, setActiveSheetState] = useState<SheetStep>("form");
  const [selectedDriver, setSelectedDriver] = useState<NearbyDriver | null>(null);
  const [focusedDriver, setFocusedDriver] = useState<NearbyDriver | null>(null);
  const [findNowLoading, setFindNowLoading] = useState(false);
  const [rideOrigin, setRideOrigin] = useState<RidePoint | null>(null);
  const [rideDestination, setRideDestination] = useState<RidePoint | null>(null);

  const { user } = useCurrentUser();
  const { submitting: confirmLoading, submit } = useRideRequest();

  const setActiveSheet = useCallback((step: SheetStep) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveSheetState(step);
  }, []);

  const {
    location,
    origin: formOrigin,
    destination: formDestination,
    usingCurrentLocation,
    ...formProps
  } = useRideRequestForm({
    onFindNowSuccess: (origin, destination) => {
      setRideOrigin(origin);
      setRideDestination(destination);
      setFindNowLoading(true);
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
    findNowLoading: findNowLoading || formProps.findNowLoading,
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
  const { drivers } = useNearbyDrivers(location);

  // Keep the Find button loading until nearby drivers are available, holding it
  // for a minimum duration so the spinner is visible; a longer fallback keeps
  // an empty search from hanging forever.
  useEffect(() => {
    if (!findNowLoading) return;
    const waitMs = drivers.length === 0 ? FIND_NOW_MAX_MS : FIND_NOW_SEARCH_MS;
    const timer = setTimeout(() => {
      setFindNowLoading(false);
      setActiveSheet("drivers");
    }, waitMs);
    return () => clearTimeout(timer);
  }, [findNowLoading, drivers.length, setActiveSheet]);

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

  const handleSelectDriver = useCallback((driver: NearbyDriver | null) => {
    setSelectedDriver(driver);
  }, []);

  // Picking from the sheet list also tells the map to pan to that driver.
  const handlePickDriverFromList = useCallback((driver: NearbyDriver) => {
    setSelectedDriver(driver);
    setFocusedDriver(driver);
  }, []);

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
          originIsCurrentLocation={usingCurrentLocation}
          selectedDriverId={selectedDriver?.id ?? null}
          focusedDriver={focusedDriver}
          onSelectDriver={handleSelectDriver}
          userImageUrl={user?.imageUrl}
          userName={user?.firstName}
        />
      </View>

      {/* Floating Header */}
      <RideRequestHeader title={headerTitle} onBack={handleBack} />

      {/* Bottom sheet overlay. The ride-info step sizes to its content so all
          details fit without scrolling; the other steps keep a fixed height. */}
      <View
        className={`absolute inset-x-0 bottom-0 justify-end ${
          activeSheet === "rideInfo" ? "max-h-[92%]" : "h-[60%]"
        }`}
      >
        {activeSheet === "form" && (
          <RideRequestForm {...formPropsWithReset} />
        )}

        {activeSheet === "drivers" && (
          <NearbyDriversSheet
            drivers={drivers}
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