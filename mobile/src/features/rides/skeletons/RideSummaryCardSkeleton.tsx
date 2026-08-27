import { View } from "react-native";
import { Shimmer } from "@/shared/components";

export function RideSummaryCardSkeleton() {
  return (
    <View className="rounded-2xl bg-white p-4 m-4">
      <View className="flex-row gap-3 mb-3.5">
        <Shimmer width={80} height={80} borderRadius={12} />
        <View className="flex-1 justify-center gap-2.5">
          <View className="flex-row items-center gap-2.5">
            <Shimmer width={8} height={8} borderRadius={4} />
            <Shimmer width="60%" height={16} borderRadius={4} />
          </View>
          <View className="flex-row items-center gap-2.5">
            <Shimmer width={20} height={20} borderRadius={10} />
            <Shimmer width="50%" height={16} borderRadius={4} />
          </View>
        </View>
      </View>
      <View className="bg-general-100 rounded-2xl overflow-hidden">
        <View className="flex-row items-center justify-between px-3.5 py-3">
          <Shimmer width="35%" height={16} borderRadius={4} />
          <Shimmer width="30%" height={16} borderRadius={4} />
        </View>
        <View className="flex-row items-center justify-between px-3.5 py-3 border-t border-general-300">
          <Shimmer width="35%" height={16} borderRadius={4} />
          <Shimmer width="25%" height={16} borderRadius={4} />
        </View>
        <View className="flex-row items-center justify-between px-3.5 py-3 border-t border-general-300">
          <Shimmer width="35%" height={16} borderRadius={4} />
          <Shimmer width="15%" height={16} borderRadius={4} />
        </View>
        <View className="flex-row items-center justify-between px-3.5 py-3">
          <Shimmer width="35%" height={16} borderRadius={4} />
          <Shimmer width="25%" height={16} borderRadius={4} />
        </View>
      </View>
    </View>
  );
}