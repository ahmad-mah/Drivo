import { View } from "react-native";
import { Shimmer } from "@/shared/components/Shimmer";

/** Placeholder row mirroring RideItem while recent rides load. */
export function RideItemSkeleton() {
  return (
    <View className="flex-row items-center gap-3 rounded-xl bg-white px-4 py-4">
      <Shimmer width={40} height={40} borderRadius={999} />
      <View className="flex-1 gap-2">
        <Shimmer height={16} borderRadius={8} />
        <Shimmer width="50%" height={12} borderRadius={8} />
      </View>
      <Shimmer width={48} height={16} borderRadius={8} />
    </View>
  );
}