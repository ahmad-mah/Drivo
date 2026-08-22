import { View } from "react-native";
import { AppSafeArea, AppGap, Shimmer } from "@/shared/components";
import { DriverFormSkeleton } from "../skeletons/DriverFormSkeleton";

export function BecomeDriverLoading() {
  return (
    <AppSafeArea>
      <View className="pt-4 pb-2">
        <Shimmer width={40} height={40} borderRadius={20} />
        <AppGap height={16} />
        <Shimmer width={160} height={28} borderRadius={6} />
        <AppGap height={8} />
        <Shimmer width={220} height={14} borderRadius={4} />
      </View>
      <AppGap height={12} />
      <DriverFormSkeleton fieldCount={5} />
      <AppGap height={24} />
      <Shimmer width="100%" height={56} borderRadius={28} />
    </AppSafeArea>
  );
}
