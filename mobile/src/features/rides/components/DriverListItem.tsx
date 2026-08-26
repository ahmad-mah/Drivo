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
  const isOffline = driver.isOnline === false;

  return (
    <Pressable
      disabled={isOffline}
      className={cn(
        "flex-row items-center gap-3.5 rounded-2xl p-3.5",
        selected ? "bg-primary-100" : "bg-general-500",
        isOffline && "opacity-50",
      )}
      onPress={onPress}
    >
      {/* Avatar */}
      <View
        className={cn(
          "size-12 overflow-hidden rounded-full bg-general-200",
          selected
            ? "border-[2.5px] border-primary-500"
            : "border-2 border-general-300",
        )}
      >
        {driver.imageUrl ? (
          <AppImage source={{ uri: driver.imageUrl }} className="size-full" />
        ) : (
          <View className="size-full items-center justify-center bg-primary-100">
            <Text className="font-Jakarta-Bold text-base text-primary-500">
              {driver.firstName.charAt(0)}
            </Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View className="flex-1 gap-1.5">
        {/* Name + rating */}
        <View className="flex-row items-center justify-between gap-2">
          <Text
            numberOfLines={1}
            className="flex-3 font-Jakarta-SemiBold text-sm text-secondary-900"
          >
            {driver.firstName} {driver.lastName}
          </Text>
          {isOffline ? (
            <View className="flex-2 items-end">
              <View className="rounded-full bg-general-200 px-2 py-0.5">
                <Text className="font-Jakarta-SemiBold text-[10px] text-secondary-500">
                  Offline
                </Text>
              </View>
            </View>
          ) : (
            <View className="flex-row flex-2 items-center gap-1">
              <AppImage
                source={require("@/assets/icons/star.png")}
                className="size-3"
              />
              <Text className="font-Jakarta-SemiBold text-xs text-secondary-800">
                {driverRating(driver)}
              </Text>
            </View>
          )}
        </View>

        {/* Stats row */}
        <View className="flex-row items-center gap-3">
          <Text className="font-Jakarta-Bold text-xs text-primary-600">
            ${formatFare(driverFare(driver))}
          </Text>
          <View className="h-3 w-px bg-general-300" />
          <Text className="font-Jakarta text-xs text-secondary-500">
            {driverEtaMinutes(driver)} min
          </Text>
          <View className="h-3 w-px bg-general-300" />
          <Text className="font-Jakarta text-xs text-secondary-500">
            {driverSeats(driver)} seats
          </Text>
        </View>
      </View>

      {/* Vehicle icon */}
      <View className="size-10 items-center justify-center rounded-xl bg-general-500">
        <Text className="text-xl">{vehicleIconFor(driver.vehicleType)}</Text>
      </View>
    </Pressable>
  );
}
