import { View } from "react-native";
import { Shimmer } from "@/shared/components";

export function RideItemSkeleton() {
  return (
    <View className="rounded-[20px] bg-white px-4 py-3.5">
      {/* Top: map + locations */}
      <View className="mb-3.5 flex-row items-center gap-3">
        <Shimmer width={80} height={80} borderRadius={12} />
        <View className="flex-1 justify-center gap-2.5">
          <View className="flex-row items-center gap-2.5">
            <Shimmer width={24} height={24} borderRadius={4} />
            <Shimmer width="70%" height={14} borderRadius={4} />
          </View>
          <View className="flex-row items-center gap-2.5">
            <Shimmer width={24} height={24} borderRadius={4} />
            <Shimmer width="55%" height={14} borderRadius={4} />
          </View>
        </View>
      </View>

      {/* Info container */}
      <View className="overflow-hidden rounded-2xl bg-primary-100">
        <View className="flex-row items-center justify-between px-3.5 py-3">
          <Shimmer width="30%" height={14} borderRadius={4} />
          <Shimmer width="40%" height={14} borderRadius={4} />
        </View>
        <View className="flex-row items-center justify-between border-b border-general-300 px-3.5 py-3">
          <Shimmer width="20%" height={14} borderRadius={4} />
          <Shimmer width="30%" height={14} borderRadius={4} />
        </View>
        <View className="flex-row items-center justify-between border-b border-general-300 px-3.5 py-3">
          <Shimmer width="25%" height={14} borderRadius={4} />
          <Shimmer width="10%" height={14} borderRadius={4} />
        </View>
        <View className="flex-row items-center justify-between px-3.5 py-3">
          <Shimmer width="35%" height={14} borderRadius={4} />
          <Shimmer width="20%" height={14} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}
