import { Text, View } from "react-native";
import { AppImage } from "@/shared/components";

export function RecentRidesEmptyState() {
  return (
    <View className="items-center rounded-2xl bg-white px-6 py-10">
      <View className="mb-4 size-16 items-center justify-center rounded-full bg-primary-100">
        <AppImage
          source={require("@/assets/icons/map.png")}
          className="size-7"
          tintColor="#0286FF"
        />
      </View>
      <Text className="mb-1 text-center font-Jakarta-Bold text-base text-secondary-900">
        No rides yet
      </Text>
      <Text className="text-center font-Jakarta text-sm leading-5 text-secondary-400">
        Your completed trips will show up here once you take your first ride.
      </Text>
    </View>
  );
}
