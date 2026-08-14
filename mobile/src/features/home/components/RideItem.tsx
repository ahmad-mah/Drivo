import { Text, View } from "react-native";
import { AppImage } from "@/shared/components";
import type { Ride } from "../types/ride.types";

export function RideItem({ item }: { item: Ride }) {
  return (
    <View className="flex-row items-center gap-3 rounded-xl bg-white px-4 py-4">
      <View className="rounded-full bg-general-600 p-2.5">
        <AppImage
          className="size-5"
          source={require("@/assets/icons/marker.png")}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="font-Jakarta-SemiBold text-base" numberOfLines={1}>
          {item.origin_address} → {item.destination_address}
        </Text>
        <Text className="font-Jakarta text-sm text-secondary-400">
          {item.driver.first_name} {item.driver.last_name} · {item.ride_time}{" "}
          min
        </Text>
      </View>
      <Text className="font-Jakarta-Bold text-base">
        ${parseInt(item.fare_price).toLocaleString()}
      </Text>
    </View>
  );
}
