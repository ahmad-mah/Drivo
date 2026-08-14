import { View } from "react-native";
import { useCurrentLocation } from "@/features/home/hooks/useCurrentLocation";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import { goBack } from "@/shared/services/navigation";
import { useDriverMode } from "../hooks/useDriverMode";
import { ConnectivityBanner } from "../components/ConnectivityBanner";
import { DriverModeFooter } from "../components/DriverModeFooter";
import { DriverModeHeader } from "../components/DriverModeHeader";
import { DriverModeMap } from "../components/DriverModeMap";
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

  useErrorSnackbar(error);

  return (
    <View className="flex-1">
      <DriverModeMap location={location} autoOffline={autoOffline} />
      <DriverModeHeader
        isOnline={isOnline}
        autoOffline={autoOffline}
        onBack={goBack}
      />
      {(autoOffline || backOnline) && (
        <ConnectivityBanner autoOffline={autoOffline} backOnline={backOnline} />
      )}
      <DriverModeFooter
        isOnline={isOnline}
        autoOffline={autoOffline}
        busy={busy}
        gpsAvailable={gpsAvailable}
        socketConnected={socketConnected}
        onToggle={toggleOnline}
      />
      <PermissionRequiredDialog
        visible={permissionDenied}
        onClose={closePermissionDialog}
      />
    </View>
  );
}
