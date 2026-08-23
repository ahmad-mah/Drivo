import { Text, View } from "react-native";
import { AppImage } from "@/shared/components";

/**
 * Empty state for the home screen's recent-rides section: concentric icon
 * medallion + short copy, matching the sheet empty-state visual language.
 */
export function RecentRidesEmptyState() {
  return (
    <View className="items-center gap-4 rounded-2xl bg-white px-6 py-9">
      <View className="size-20 items-center justify-center rounded-full bg-general-200">
        <View className="size-[52px] items-center justify-center rounded-full bg-white">
          <AppImage
            source={require("@/assets/icons/map.png")}
            className="size-6"
            tintColor="#0286FF"
          />
        </View>
      </View>
      <View className="gap-1">
        <Text className="text-center font-Jakarta-Bold text-base text-secondary-900">
          No rides yet
        </Text>
        <Text className="text-center font-Jakarta text-sm leading-5 text-secondary-400">
          Your completed trips will show up here once you take your first ride.
        </Text>
      </View>
    </View>
  );
}
