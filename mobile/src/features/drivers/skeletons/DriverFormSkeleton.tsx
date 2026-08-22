import { View } from "react-native";
import { Shimmer, AppGap } from "@/shared/components";

function FormFieldSkeleton() {
  return (
    <View className="w-full">
      <Shimmer width={110} height={16} borderRadius={4} />
      <AppGap height={8} />
      <Shimmer width="100%" height={50} borderRadius={12} />
    </View>
  );
}

export function DriverFormSkeleton({ fieldCount }: { fieldCount: number }) {
  return (
    <View className="rounded-2xl bg-white p-5 shadow-sm">
      <Shimmer width={130} height={18} borderRadius={4} />
      <AppGap height={16} />
      <View className="gap-4">
        {Array.from({ length: fieldCount }, (_, i) => (
          <FormFieldSkeleton key={i} />
        ))}
      </View>
    </View>
  );
}
