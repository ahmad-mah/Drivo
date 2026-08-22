import { Text, View } from "react-native";
import { AppButton } from "@/shared/components";

interface RideExpiredCardProps {
  onTryAgain: () => void;
}

/** Terminal card shown when a ride request expired before a driver accepted. */
export function RideExpiredCard({ onTryAgain }: RideExpiredCardProps) {
  return (
    <View
      className="gap-4 rounded-t-4xl bg-white px-5 pt-8 pb-10"
      style={{
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