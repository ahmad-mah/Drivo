import { Pressable, Text, View } from "react-native";
import { AppGap, AppImage } from "@/shared/components";

interface BecomeDriverHeaderProps {
  isReapply: boolean;
  isVehicleChange: boolean;
  onBack: () => void;
}

export function BecomeDriverHeader({
  isReapply,
  isVehicleChange,
  onBack,
}: BecomeDriverHeaderProps) {
  const title = isReapply
    ? "Re-apply to Drive"
    : isVehicleChange
      ? "Update Vehicle"
      : "Apply to Drive";
  const subtitle = isReapply
    ? "Update your details to resubmit your application"
    : isVehicleChange
      ? "Your updated vehicle will be reviewed again"
      : "Fill in your details to start earning";

  return (
    <View className="pt-4 pb-2">
      <Pressable
        onPress={onBack}
        className="rounded-full bg-white p-2.5 self-start"
      >
        <AppImage
          source={require("@/assets/icons/back-arrow.png")}
          className="size-6"
          tintColor="#333333"
        />
      </Pressable>
      <AppGap height={16} />
      <Text className="text-2xl font-Jakarta-Bold text-secondary-900">
        {title}
      </Text>
      <Text className="text-sm text-secondary-600 font-Jakarta-Regular mt-1">
        {subtitle}
      </Text>
    </View>
  );
}
