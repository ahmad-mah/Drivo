import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "@/shared/components";

interface RideExpiredCardProps {
  onTryAgain: () => void;
}

/** Terminal card shown when a ride request expired before a driver accepted. */
export function RideExpiredCard({ onTryAgain }: RideExpiredCardProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="gap-4 rounded-t-4xl bg-white px-5 pt-8"
      style={{
        paddingBottom: insets.bottom + 24,
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 16,
        shadowOpacity: 0.15,
        elevation: 8,
      }}
    >
      <Text className="font-Jakarta-Bold text-2xl text-secondary-900">
        No driver found
      </Text>
      <Text className="font-Jakarta text-secondary-400">
        Your request expired because no nearby driver picked it up. Try again in
        a moment.
      </Text>
      <AppButton title="Try again" onPress={onTryAgain} />
    </View>
  );
}