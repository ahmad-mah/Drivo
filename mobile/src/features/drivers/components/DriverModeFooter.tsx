import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "@/shared/components";

interface DriverModeFooterProps {
  isOnline: boolean;
  autoOffline: boolean;
  busy: boolean;
  gpsAvailable: boolean;
  socketConnected: boolean;
  onToggle: () => void;
}

/** Bottom action area for driver mode: status summary plus Go Online/Offline. */
export function DriverModeFooter({
  isOnline,
  autoOffline,
  busy,
  gpsAvailable,
  socketConnected,
  onToggle,
}: DriverModeFooterProps) {
  const insets = useSafeAreaInsets();

  return (
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
        onPress={onToggle}
      />
    </View>
  );
}
