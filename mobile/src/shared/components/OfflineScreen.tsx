import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "./AppButton";
import { AppGap } from "./AppGap";
import { useConnectivity } from "@/hooks/useConnectivity";

export function OfflineScreen() {
  const { status, checking, retry } = useConnectivity();
  const insets = useSafeAreaInsets();

  const isNoInternet = status === "no-internet";

  return (
    <View
      className="flex-1 items-center justify-center bg-white px-6"
      style={{ paddingBottom: insets.bottom + 20 }}
    >
      <Text className="text-6xl">{isNoInternet ? "📡" : "🛠️"}</Text>
      <AppGap height={24} />
      <Text className="text-2xl font-Jakarta-Bold text-secondary-900">
        {isNoInternet ? "No internet connection" : "Can't reach Drivo right now"}
      </Text>
      <AppGap height={8} />
      <Text className="text-center text-sm font-Jakarta-Regular text-secondary-600">
        {isNoInternet
          ? "Make sure you're connected to the internet and try again."
          : "Our servers seem to be having trouble. Please try again in a moment."}
      </Text>
      <AppGap height={24} />
      <AppButton title="Retry" loading={checking} onPress={retry} />
    </View>
  );
}