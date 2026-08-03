import { View } from "react-native";
import { AppSafeArea, AppGap, Shimmer } from "@/shared/components";

export function DriverProfileSkeleton() {
  return (
    <AppSafeArea>
      <View className="pt-4 pb-2">
        <Shimmer width={40} height={40} borderRadius={20} />
        <AppGap height={16} />
        <Shimmer width={180} height={28} borderRadius={6} />
        <AppGap height={8} />
        <Shimmer width={200} height={14} borderRadius={4} />
      </View>
      <AppGap height={12} />
      <Shimmer width="100%" height={120} borderRadius={16} />
      <AppGap height={16} />
      <Shimmer width="100%" height={160} borderRadius={16} />
      <AppGap height={24} />
      <Shimmer width="100%" height={56} borderRadius={28} />
    </AppSafeArea>
  );
}
