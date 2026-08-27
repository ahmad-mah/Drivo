import { View } from "react-native";
import { Shimmer } from "@/shared/components/Shimmer";

function SkeletonRow() {
  return (
    <View className="flex-row items-center gap-3.5 rounded-2xl bg-general-500 p-3.5">
      <Shimmer width={48} height={48} borderRadius={24} />
      <View className="flex-1 gap-2">
        <View className="flex-row items-center justify-between">
          <Shimmer height={14} borderRadius={4} width="55%" />
          <Shimmer height={12} borderRadius={6} width={36} />
        </View>
        <View className="flex-row items-center gap-3">
          <Shimmer height={12} borderRadius={4} width={32} />
          <Shimmer height={12} borderRadius={4} width={28} />
          <Shimmer height={12} borderRadius={4} width={28} />
        </View>
      </View>
      <Shimmer width={40} height={40} borderRadius={12} />
    </View>
  );
}

export function DriverListSkeleton() {
  return (
    <View className="flex-1 gap-3">
      {/* Header skeleton */}
      <View className="flex-row items-center justify-between px-1 pb-2 pt-1">
        <Shimmer height={14} borderRadius={4} width={90} />
        <Shimmer height={20} borderRadius={10} width={24} />
      </View>
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </View>
  );
}
