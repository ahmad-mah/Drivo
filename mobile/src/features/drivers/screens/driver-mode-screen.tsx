import { View } from "react-native";
import { useCurrentLocation } from "@/features/home/hooks/useCurrentLocation";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import { goBack } from "@/shared/services/navigation";
import { useDriverMode } from "../hooks/useDriverMode";
import { useDriverTrip } from "../hooks/useDriverTrip";
import { useIncomingRide } from "../hooks/useIncomingRide";
import { DriverModeHeader } from "../components/DriverModeHeader";
import { DriverModeMap } from "../components/DriverModeMap";
import { DriverModeOverlays } from "../components/DriverModeOverlays";
import { PermissionRequiredDialog } from "../components/PermissionRequiredDialog";

export function DriverModeScreen() {
  const {
    isOnline,
    busy,
    error,
    socketConnected,
    gpsAvailable,
    permissionDenied,
    autoOffline,
    backOnline,
    closePermissionDialog,
    toggleOnline,
  } = useDriverMode();
  const location = useCurrentLocation();
  const incomingRide = useIncomingRide(isOnline);
  const {
    trip,
    loading: tripLoading,
    acting: tripActing,
    error: tripError,
    arrive,
    start,
    arrivedAtDestination,
    complete,
    cancel: cancelTrip,
    noShow: markNoShow,
    dismiss: dismissTrip,
  } = useDriverTrip();

  useErrorSnackbar(error);
  useErrorSnackbar(tripError);

  // One action at a time: while anything is in flight (toggle, trip action,
  // offer response) every control on this screen goes inert. The pressed
  // control keeps its own spinner.
  const screenBusy = busy || tripActing || incomingRide.responding;

  return (
    <View className="flex-1">
      <DriverModeMap location={location} autoOffline={autoOffline} />
      <DriverModeHeader
        isOnline={isOnline || !!trip}
        autoOffline={autoOffline}
        onBack={goBack}
      />

      <View pointerEvents={screenBusy ? "none" : "auto"}>
        <DriverModeOverlays
          autoOffline={autoOffline}
          backOnline={backOnline}
          availability={{
            isOnline,
            busy,
            gpsAvailable,
            socketConnected,
            onToggle: toggleOnline,
          }}
          incoming={{
            request: incomingRide.request,
            secondsLeft: incomingRide.secondsLeft,
            responding: incomingRide.responding,
            onAccept: incomingRide.accept,
            onReject: incomingRide.reject,
          }}
          trip={{
            trip,
            loading: tripLoading,
            acting: tripActing,
            onArrive: arrive,
            onStart: start,
            onArrivedAtDestination: arrivedAtDestination,
            onComplete: complete,
            onCancel: () => void cancelTrip(),
            onNoShow: () => void markNoShow(),
            onDismissSummary: () => void dismissTrip(),
          }}
        />
      </View>

      <PermissionRequiredDialog
        visible={permissionDenied}
        onClose={closePermissionDialog}
      />
    </View>
  );
}
