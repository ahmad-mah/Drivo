import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIconButton } from "@/shared/components";

interface DriverModeHeaderProps {
  isOnline: boolean;
  autoOffline: boolean;
  onBack: () => void;
}

/** Top bar for driver mode: back button plus the live/offline status pill. */
export function DriverModeHeader({
  isOnline,
  autoOffline,
  onBack,
}: DriverModeHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute inset-x-0 flex-row items-start justify-between px-5"
      style={{ top: insets.top + 12 }}
    >
      <AppIconButton
        icon={require("@/assets/icons/back-arrow.png")}
        onPress={onBack}
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
  );
}
