import { useState } from "react";
import { Linking, Text, View } from "react-native";
import type { Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCurrentLocation } from "@/features/home/hooks/useCurrentLocation";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import { goBack } from "@/shared/services/navigation";
import {
  AppButton,
  AppDialog,
  AppGap,
  AppIconButton,
  AppMapView,
} from "@/shared/components";
import { useDriverMode } from "../hooks/useDriverMode";

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
  const insets = useSafeAreaInsets();
  // Freeze the last online region so the map stays put during auto-offline
  // instead of following the GPS watch (a driver offline has no live location).
  // Snapshotted on the offline transition while rendering (the React
  // "adjust state during render" pattern) — not in an effect.
  const [frozenRegion, setFrozenRegion] = useState<Region | null>(null);
  const [wasOffline, setWasOffline] = useState(autoOffline);
  if (wasOffline !== autoOffline) {
    setWasOffline(autoOffline);
    if (autoOffline && location) {
      setFrozenRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }

  const liveRegion: Region = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 30.0444,
        longitude: 31.2357,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
  const region = autoOffline && frozenRegion ? frozenRegion : liveRegion;

  useErrorSnackbar(error);

  return (
    <View className="flex-1">
      <AppMapView
        className="flex-1"
        showsBuildings={false}
        showsTraffic={false}
        showsIndoorLevelPicker={false}
        toolbarEnabled={false}
        showsUserLocation={!autoOffline}
        showsMyLocationButton
        showsCompass
        pitchEnabled
        rotateEnabled
        region={region}
      />

      {autoOffline && (
        <View className="absolute inset-0 bg-black/20" pointerEvents="none" />
      )}

      <View
        className="absolute inset-x-0 flex-row items-start justify-between px-5"
        style={{ top: insets.top + 12 }}
      >
        <AppIconButton
          icon={require("@/assets/icons/back-arrow.png")}
          onPress={goBack}
          tintColor="#333333"
        />
        <View className="flex-row items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
          <View
            className={`size-3 rounded-full ${autoOffline ? "bg-gray-300" : isOnline ? "bg-green-500" : "bg-gray-300"}`}
          />
          <Text className="text-sm font-Jakarta-Medium text-secondary-900">
            {autoOffline
              ? "You're offline"
              : isOnline
                ? "You are online"
                : "You are offline"}
          </Text>
        </View>
      </View>

      {(autoOffline || backOnline) && (
        <View className="absolute inset-x-0 px-5" style={{ top: insets.top + 64 }}>
          <View
            className={`rounded-2xl p-4 shadow-sm ${autoOffline ? "bg-amber-50" : "bg-green-50"}`}
          >
            <Text
              className={`text-sm font-Jakarta-Bold ${autoOffline ? "text-amber-700" : "text-green-700"}`}
            >
              {autoOffline ? "Connectivity lost" : "You're back online"}
            </Text>
            <Text className="mt-1 text-xs font-Jakarta-Regular text-secondary-600">
              {autoOffline
                ? "You've been taken offline. You'll be back online automatically when your connection returns."
                : "Your connection is back and you're accepting new rides again."}
            </Text>
          </View>
        </View>
      )}

      <View
        className="absolute inset-x-0 bottom-0 gap-3 px-5"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <View className="flex-row items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
          <View className="flex-1 gap-1">
            <Text className="text-lg font-Jakarta-Bold text-secondary-900">
              {autoOffline ? "You're offline" : isOnline ? "Accepting new rides" : "Driver mode"}
            </Text>
            <Text className="text-sm font-Jakarta-Regular text-secondary-600">
              {autoOffline
                ? "We lost your connection. You'll be back online automatically when it returns."
                : isOnline
                  ? "Riders can see your live location"
                  : "Go online to start receiving rides"}
            </Text>
            {isOnline && !gpsAvailable && (
              <Text className="text-xs font-Jakarta-Medium text-amber-600">
                Turn on device location (GPS) to keep sharing it
              </Text>
            )}
            {socketConnected === false && !autoOffline && (
              <Text className="text-xs font-Jakarta-Regular text-amber-600">
                Reconnecting…
              </Text>
            )}
          </View>
        </View>

        <AppButton
          title={isOnline ? "Go Offline" : "Go Online"}
          variant={isOnline ? "outline" : "primary"}
          loading={busy}
          onPress={toggleOnline}
        />
      </View>

      <AppDialog
        visible={permissionDenied}
        onClose={closePermissionDialog}
      >
        <Text className="text-lg font-Jakarta-Bold text-secondary-900">
          Location permission required
        </Text>
        <AppGap height={8} />
        <Text className="text-center text-sm font-Jakarta-Regular text-secondary-600">
          Location permission was denied. Enable it in Settings to start driving.
        </Text>
        <AppGap height={20} />
        <AppButton
          title="Open Settings"
          onPress={() => {
            closePermissionDialog();
            void Linking.openSettings();
          }}
        />
        <AppGap height={12} />
        <AppButton
          title="Cancel"
          variant="outline"
          onPress={closePermissionDialog}
        />
      </AppDialog>
    </View>
  );
}