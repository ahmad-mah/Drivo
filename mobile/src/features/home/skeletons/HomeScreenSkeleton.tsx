import { ScrollView, View } from "react-native";
import { AppGap, AppSafeArea, Shimmer } from "@/shared/components";
import { RideItemSkeleton } from "./RideItemSkeleton";

const RIDE_SKELETON_ROWS = [0, 1, 2];

/** Full-screen placeholder mirroring HomeScreen while profile data loads. */
export function HomeScreenSkeleton() {
  return (
    <AppSafeArea>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        <AppGap height={20} />
        <View className="flex-row items-center justify-between">
          <Shimmer width={180} height={28} borderRadius={6} />
          <Shimmer width={40} height={40} borderRadius={20} />
        </View>
        <AppGap height={16} />
        <View className="w-full flex-row items-center gap-3 rounded-2xl bg-general-300 p-4">
          <Shimmer width={28} height={28} borderRadius={14} />
          <View className="flex-1 gap-2">
            <Shimmer width="40%" height={16} borderRadius={8} />
            <Shimmer width="70%" height={12} borderRadius={8} />
          </View>
        </View>
        <AppGap height={16} />
        <View className="flex-row items-center gap-3 rounded-full bg-general-300 px-5 py-4">
          <Shimmer width={28} height={28} borderRadius={14} />
          <Shimmer width="55%" height={16} borderRadius={8} />
        </View>
        <AppGap height={20} />
        <View className="gap-2">
          <Shimmer width={180} height={20} borderRadius={6} />
          <Shimmer height={240} borderRadius={16} />
        </View>
        <AppGap height={24} />
        <View className="gap-3">
          <Shimmer width={120} height={18} borderRadius={6} />
          {RIDE_SKELETON_ROWS.map((key) => (
            <RideItemSkeleton key={key} />
          ))}
        </View>
      </ScrollView>
    </AppSafeArea>
  );
}