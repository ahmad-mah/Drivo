import { Pressable, Text, View } from "react-native";
import { AppImage } from "@/shared/components";
import type { DriverProfile } from "@/api/drivers/drivers.api";
import { driverStatusConfig } from "../constants/driverStatusConfig";
import { getReapplyCooldownDays } from "../utils/driverCooldown";

type Props = {
  application: DriverProfile;
  onPress?: () => void;
};

export function DriverStatusCard({ application, onPress }: Props) {
  const config = driverStatusConfig[application.approvalStatus];
  const cooldownDays = getReapplyCooldownDays(application);
  const description =
    cooldownDays !== null
      ? `You can re-apply in ${cooldownDays} day${cooldownDays === 1 ? "" : "s"}.`
      : config.description;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={`w-full flex-row items-center gap-3 rounded-2xl p-4 ${config.bg}`}
    >
      <Text className="text-xl">{config.icon}</Text>
      <View className="flex-1 gap-0.5">
        <Text className={`text-base font-Jakarta-Bold ${config.color}`}>
          {config.label}
        </Text>
        <Text className="text-sm text-secondary-600 font-Jakarta-Regular">
          {description}
        </Text>
      </View>
      {onPress && (
        <AppImage
          source={require("@/assets/icons/back-arrow.png")}
          className="size-5 rotate-180"
          tintColor="#858585"
        />
      )}
    </Pressable>
  );
}
