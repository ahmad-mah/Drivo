import { Pressable, Text, View } from "react-native";
import { AppImage } from "@/shared/components";
import { vehicleIconFor } from "@/shared/constants/vehicleIcons";
import { cn } from "@/shared/utils/cn";
import { formatFare } from "@/shared/utils/format";
import type { NearbyDriver } from "../types/ride.types";
import {
  driverEtaMinutes,
  driverFare,
  driverRating,
  driverSeats,
} from "../utils/driverDisplay";

interface DriverListItemProps {
  driver: NearbyDriver;
  selected: boolean;
  onPress: () => void;
}

export function DriverListItem({
  driver,
  selected,
  onPress,
}: DriverListItemProps) {
  return (
    <Pressable
      className={cn(
        "flex-row items-center gap-3.5 p-3.5 transition-all",
        selected ? "bg-primary-300" : "bg-white",
      )}
      onPress={onPress}
    >
      {/* Driver Avatar */}
      <View
        className={cn(
          "size-12 overflow-hidden rounded-full bg-general-100",
          selected
            ? "border-[2.5px] border-[#34C759]"
            : "border border-[#E5E5E5]",
        )}
      >
        {driver.imageUrl ? (
          <AppImage source={{ uri: driver.imageUrl }} className="size-full" />
        ) : (
          <View className="size-full items-center justify-center bg-general-200">
            <Text className="font-Jakarta-Bold text-lg text-secondary-400">
              {driver.firstName.charAt(0)}
            </Text>
          </View>
        )}
      </View>

      {/* Driver Details */}
      <View className="flex-1 gap-1.5">
        {/* Row: name + rating */}
        <View className="flex-row items-center justify-between gap-2">
          <Text
            numberOfLines={1}
            className="flex-3 font-Jakarta-SemiBold text-base text-secondary-900"
          >
            {driver.firstName} {driver.lastName}
          </Text>
          <View className="flex-row flex-2 items-center gap-1">
            <AppImage
              source={require("@/assets/icons/star.png")}
              className="size-3.5"
            />
            <Text className="font-Jakarta-SemiBold text-xs text-secondary-800">
              {driverRating(driver)}
            </Text>
          </View>
        </View>

        {/* Row: price | divider | time | divider | seats */}
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <AppImage
              source={require("@/assets/icons/dollar.png")}
              className="size-3.5 "
            />
            <Text className="font-Jakarta-Bold text-xs text-general-900">
              ${formatFare(driverFare(driver))}
            </Text>
          </View>

          <View className="h-3.5 w-px bg-general-200" />

          <Text className="font-Jakarta-SemiBold text-xs text-gray-500">
            {driverEtaMinutes(driver)} min
          </Text>

          <View className="h-3.5 w-px bg-general-200" />

          <View className="flex-row items-center gap-1">
            <AppImage
              source={require("@/assets/icons/person.png")}
              className="size-3.5"
              tintColor="#737373"
            />
            <Text className="font-Jakarta-SemiBold text-xs text-gray-500">
              {driverSeats(driver) + " Seats"}
            </Text>
          </View>
        </View>
      </View>

      {/* Vehicle icon (same emojis as the become-driver form) */}
      <Text className="text-4xl">{vehicleIconFor(driver.vehicleType)}</Text>
    </Pressable>
  );
}
