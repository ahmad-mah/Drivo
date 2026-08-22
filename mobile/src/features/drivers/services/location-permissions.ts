import * as Location from "expo-location";
import { Platform } from "react-native";

export interface DriverLocationPermissions {
  foreground: boolean;
  background: boolean;
  /** True when the permission is denied and the OS will not prompt again.
   *  The user must re-enable it from system settings. */
  canAskAgain: boolean;
}

/**
 * Acquires the location permissions the driver session needs: foreground
 * (required to start updates) and background (required for the task to keep
 * streaming after the app is backgrounded).
 *
 * Android: the driver task runs as a location foreground service (it shows a
 * notification), which does not require ACCESS_BACKGROUND_LOCATION — and that
 * permission isn't declared in the manifest, so requesting it would throw.
 * Background permission is only relevant on iOS ("Always").
 */
export async function requestDriverLocationPermissions(): Promise<DriverLocationPermissions> {
  const foreground = await Location.requestForegroundPermissionsAsync();

  if (foreground.status !== Location.PermissionStatus.GRANTED) {
    return {
      foreground: false,
      background: false,
      canAskAgain: foreground.canAskAgain !== false,
    };
  }

  if (Platform.OS === "android") {
    return { foreground: true, background: true, canAskAgain: true };
  }

  const background = await Location.requestBackgroundPermissionsAsync();

  return {
    foreground: true,
    background: background.status === Location.PermissionStatus.GRANTED,
    canAskAgain: true,
  };
}

/** Whether the device's location services (GPS master switch) are on.
 *  Separate from app permission — the user can revoke it from quick settings
 *  while the app permission is still granted. */
export async function isGpsEnabled() {
  return Location.hasServicesEnabledAsync();
}