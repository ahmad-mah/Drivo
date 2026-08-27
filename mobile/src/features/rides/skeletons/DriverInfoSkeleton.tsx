import { View } from "react-native";
import { Shimmer } from "@/shared/components/Shimmer";

export function DriverInfoSkeleton() {
  return (
    <View className="flex-1 gap-5 px-5 pt-5">
      {/* Handle bar placeholder */}
      <Shimmer height={4} borderRadius={2} width={40} />

      {/* Driver hero */}
      <View className="items-center gap-3">
        <Shimmer width={76} height={76} borderRadius={38} />
        <View className="items-center gap-2">
          <Shimmer height={20} borderRadius={6} width="55%" />
          <Shimmer height={14} borderRadius={4} width="40%" />
          <Shimmer height={22} borderRadius={11} width={60} />
        </View>
      </View>

      {/* Route card */}
      <View className="gap-3 rounded-2xl bg-general-300 p-4">
        <View className="flex-row items-start gap-3">
          <View className="gap-1 pt-0.5">
            <Shimmer width={8} height={8} borderRadius={4} />
            <Shimmer width={1} height={32} borderRadius={0} />
            <Shimmer width={8} height={8} borderRadius={4} />
          </View>
          <View className="flex-1 gap-4">
            <Shimmer height={14} borderRadius={4} width="80%" />
            <Shimmer height={14} borderRadius={4} width="65%" />
          </View>
        </View>
      </View>

      {/* Trip stats */}
      <View className="flex-row gap-3">
        <View className="flex-1 items-center gap-1.5 rounded-2xl bg-general-300 py-3.5">
          <Shimmer height={12} borderRadius={4} width={32} />
          <Shimmer height={16} borderRadius={4} width={48} />
        </View>
        <View className="flex-1 items-center gap-1.5 rounded-2xl bg-general-300 py-3.5">
          <Shimmer height={12} borderRadius={4} width={36} />
          <Shimmer height={16} borderRadius={4} width={40} />
        </View>
        <View className="flex-1 items-center gap-1.5 rounded-2xl bg-general-300 py-3.5">
          <Shimmer height={12} borderRadius={4} width={28} />
          <Shimmer height={16} borderRadius={4} width={24} />
        </View>
      </View>

      {/* Button */}
      <Shimmer height={52} borderRadius={99} />
    </View>
  );
}
