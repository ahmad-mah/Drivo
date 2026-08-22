import { useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton, AppImage } from "@/shared/components";
import { formatFare } from "@/shared/utils/format";
import type { NearbyDriver, RidePoint } from "../types/ride.types";
import {
  driverEtaMinutes,
  driverFare,
  driverRating,
  driverSeats,
} from "../utils/driverDisplay";

interface RideInfoSheetProps {
  driver: NearbyDriver | null;
  origin: RidePoint | null;
  destination: RidePoint | null;
  onConfirm: () => void;
  confirmLoading: boolean;
}

/**
 * Bottom sheet confirming a ride before booking. Shows the driver profile,
 * a fare/pickup/seats card, the route endpoints, and a Confirm Ride CTA.
 */
export function RideInfoSheet({
  driver,
  origin,
  destination,
  onConfirm,
  confirmLoading,
}: RideInfoSheetProps) {
  const insets = useSafeAreaInsets();
  const [imageError, setImageError] = useState(false);

  return (
    <View
      className="flex-1 gap-6 rounded-t-4xl bg-white px-5 pt-5"
      style={{
        paddingBottom: insets.bottom + 16,
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 16,
        shadowOpacity: 0.15,
        elevation: 8,
      }}
    >
      <Text className="font-Jakarta-Bold text-xl text-secondary-900">
        Ride Information
      </Text>

      {/* Full-width divider, edge to edge, light grey */}
      <View className="-mx-5 h-px bg-gray-300" />

      {/* Driver profile, centered */}
      <View className="items-center gap-2">
        <View className="size-20 overflow-hidden rounded-full bg-white shadow-sm">
          {driver?.imageUrl && !imageError ? (
            <AppImage
              source={{ uri: driver.imageUrl }}
              className="size-full"
              contentFit="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View className="size-full items-center justify-center bg-general-200">
              <Text className="font-Jakarta-Bold text-2xl text-secondary-400">
                {driver ? driver.firstName.charAt(0) : "?"}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-1.5">
          <Text className="font-Jakarta-Bold text-lg text-secondary-900">
            {driver ? `${driver.firstName} ${driver.lastName}` : "Any available driver"}
          </Text>
          {driver && (
            <View className="flex-row items-center gap-1">
              <AppImage
                source={require("@/assets/icons/star.png")}
                className="size-3.5"
              />
              <Text className="font-Jakarta-Bold text-sm text-secondary-700">
                {driverRating(driver)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Fare / pickup / seats card */}
      <View className="rounded-3xl bg-primary-200 px-4 py-2">
        <View className="flex-row items-center justify-between py-3">
          <Text className="font-Jakarta-Medium text-base text-black">
            Ride Price
          </Text>
          <Text className="font-Jakarta-SemiBold text-base text-[#34C759]">
            {driver ? `$${formatFare(driverFare(driver))}` : "Calculating..."}
          </Text>
        </View>
        <View className="h-0.5 bg-white" />
        <View className="flex-row items-center justify-between py-3">
          <Text className="font-Jakarta-Medium text-base text-black">
            Pickup time
          </Text>
          <Text className="font-Jakarta-SemiBold text-base text-secondary-900">
            {driver ? `${driverEtaMinutes(driver)} min` : "~5 min"}
          </Text>
        </View>
        <View className="h-0.5 bg-white" />
        <View className="flex-row items-center justify-between py-3">
          <Text className="font-Jakarta-Medium text-base text-black">
            Car seats
          </Text>
          <Text className="font-Jakarta-SemiBold text-base text-secondary-900">
            {driver ? driverSeats(driver) : "4"}
          </Text>
        </View>
      </View>

      {/* Route endpoints, framed top and bottom with a divider between */}
      <View>
        <View className="h-px bg-gray-200" />
        <View className="flex-row items-center gap-3 py-4">
          <AppImage
            source={require("@/assets/icons/to.png")}
            className="size-6"
          />
          <Text
            className="flex-1 font-Jakarta-SemiBold text-base text-black"
            numberOfLines={1}
          >
            {destination?.address || "Selected destination"}
          </Text>
        </View>
        <View className="h-px bg-gray-200" />
        <View className="flex-row items-center gap-3 py-4">
          <AppImage
            source={require("@/assets/icons/point.png")}
            className="size-6"
          />
          <Text
            className="flex-1 font-Jakarta-SemiBold text-base text-black"
            numberOfLines={1}
          >
            {origin?.address || "Current Location"}
          </Text>
        </View>
        <View className="h-px bg-gray-200" />
      </View>

      <AppButton
        title="Confirm Ride"
        onPress={onConfirm}
        loading={confirmLoading}
      />
    </View>
  );
}
