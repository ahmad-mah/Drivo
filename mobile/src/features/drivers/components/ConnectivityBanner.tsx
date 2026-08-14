import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ConnectivityBannerProps {
  autoOffline: boolean;
  backOnline: boolean;
}

/** Transient notice shown when connectivity drops or returns while driving. */
export function ConnectivityBanner({
  autoOffline,
  backOnline,
}: ConnectivityBannerProps) {
  const insets = useSafeAreaInsets();

  return (
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
  );
}
