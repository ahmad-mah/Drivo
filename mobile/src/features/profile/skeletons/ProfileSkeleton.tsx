import { View } from "react-native";
import { Shimmer, AppGap } from "@/shared/components";

function FieldSkeleton() {
  return (
    <>
      <Shimmer width={96} height={16} borderRadius={4} />
      <AppGap height={8} />
      <Shimmer width="100%" height={52} borderRadius={24} />
    </>
  );
}

export function ProfileSkeleton() {
  return (
    <View className="pb-8">
      <AppGap height={20} />

      <Shimmer width={180} height={28} borderRadius={6} />

      <AppGap height={18} />

      <View className="items-center">
        <Shimmer width={112} height={112} borderRadius={56} />
      </View>

      <AppGap height={24} />

      <View className="w-full rounded-2xl p-4 bg-general-300">
        <View className="flex-row items-center gap-3">
          <Shimmer width={24} height={24} borderRadius={12} />
          <Shimmer width={180} height={20} borderRadius={4} />
        </View>
        <AppGap height={8} />
        <View className="ml-9">
          <Shimmer width={220} height={14} borderRadius={4} />
          <AppGap height={6} />
          <Shimmer width={140} height={14} borderRadius={4} />
        </View>
      </View>

      <AppGap height={24} />

      <View className="rounded-2xl bg-white p-5 elevation-sm shadow-sm">
        <FieldSkeleton />
        <AppGap height={16} />
        <FieldSkeleton />
        <AppGap height={16} />
        <Shimmer width={48} height={16} borderRadius={4} />
        <AppGap height={8} />
        <Shimmer width="100%" height={52} borderRadius={24} />
        <AppGap height={16} />
        <FieldSkeleton />
        <AppGap height={24} />
        <Shimmer width="100%" height={56} borderRadius={28} />
      </View>

      <View className="mt-8">
        <Shimmer width="100%" height={56} borderRadius={28} />
      </View>
    </View>
  );
}
