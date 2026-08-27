import { Text, View } from "react-native";
import { formatCountdown } from "@/shared/utils/format";

interface NoShowCountdownProps {
  secondsLeft: number;
  totalSeconds: number;
}

export function NoShowCountdown({
  secondsLeft,
  totalSeconds,
}: NoShowCountdownProps) {
  const ratio = totalSeconds > 0
    ? Math.max(0, Math.min(1, secondsLeft / totalSeconds))
    : 0;

  return (
    <View className="gap-1.5">
      <Text className="font-Jakarta-Bold text-base text-secondary-900">
        Waiting for the rider · {formatCountdown(secondsLeft)}
      </Text>
      <View className="h-1.5 overflow-hidden rounded-full bg-general-300">
        <View
          className="h-full rounded-full bg-green-500"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </View>
    </View>
  );
}
