import { View, Text } from "react-native";
import { AppButton, AppGap, AppImage } from "@/shared/components";

type SuccessDialogProps = {
  onBrowseHome: () => void;
  loading?: boolean;
};

export function SuccessDialog({ onBrowseHome, loading }: SuccessDialogProps) {
  return (
    <View className="w-full items-center">
      <AppImage
        source={require("@/assets/images/check.png")}
        className="size-24"
        contentFit="contain"
      />
      <AppGap height={24} />
      <Text className="text-3xl font-Jakarta-Bold text-center text-secondary-950">
        Verified!
      </Text>
      <AppGap height={8} />
      <Text className=" font-Jakarta-Medium text-lg text-gray-500 text-center">
        You have successfully verified your account.
      </Text>
      <AppGap height={24} />
      <AppButton title="Browse Home" onPress={onBrowseHome} loading={loading} />
    </View>
  );
}
