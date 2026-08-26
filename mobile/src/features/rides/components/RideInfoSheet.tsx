import { useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton, AppImage } from "@/shared/components";
import { vehicleIconFor } from "@/shared/constants/vehicleIcons";
import { formatFare } from "@/shared/utils/format";
import type { NearbyDriver, RidePoint } from "../types/ride.types";
import {
  driverEtaMinutes,
  driverFare,
  driverRating,
  driverSeats,
  driverVehicleLabel,
} from "../utils/driverDisplay";
import { DriverInfoSkeleton } from "../skeletons/DriverInfoSkeleton";
import { StatCard } from "./StatCard";

interface RideInfoSheetProps {
  driver: NearbyDriver | null;
  origin: RidePoint | null;
  destination: RidePoint | null;
  onConfirm: () => void;
  confirmLoading: boolean;
}

export function RideInfoSheet({
  driver,
  origin,
  destination,
  onConfirm,
  confirmLoading,
}: RideInfoSheetProps) {
  const insets = useSafeAreaInsets();
  const [imageError, setImageError] = useState(false);

  if (!driver) {
    return (
      <View
        className="flex-1 rounded-t-4xl bg-white"
        style={{
          paddingBottom: insets.bottom + 16,
          shadowColor: "#101010",
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 12,
          shadowOpacity: 0.08,
          elevation: 8,
        }}
      >
        <DriverInfoSkeleton />
      </View>
    );
  }

  return (
    <View
      className="flex-1 rounded-t-4xl bg-white"
      style={{
        paddingBottom: insets.bottom + 20,
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 12,
        shadowOpacity: 0.08,
        elevation: 8,
      }}
    >
      {/* Handle bar */}
      <View className="items-center pt-3 pb-2">
        <View className="h-1 w-10 rounded-full bg-general-300" />
      </View>

      <View className="flex-1 gap-5 px-5 pt-2">
        {/* ── Driver Hero ─────────────────────────── */}
        <View className="items-center gap-3">
          <View className="relative">
            <View className="size-[76px] overflow-hidden rounded-full border-[3px] border-primary-200">
              {driver.imageUrl && !imageError ? (
                <AppImage
                  source={{ uri: driver.imageUrl }}
                  className="size-full"
                  contentFit="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <View className="size-full items-center justify-center bg-primary-100">
                  <Text className="font-Jakarta-Bold text-2xl text-primary-500">
                    {driver.firstName.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
            <View className="absolute -bottom-1 -right-1 size-6 items-center justify-center rounded-full bg-green-500">
              <AppImage
                source={require("@/assets/icons/check.png")}
                className="size-3"
                tintColor="#FFFFFF"
              />
            </View>
          </View>

          <View className="items-center gap-1">
            <Text className="font-Jakarta-Bold text-xl text-secondary-900">
              {driver.firstName} {driver.lastName}
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-lg">{vehicleIconFor(driver.vehicleType)}</Text>
              <Text className="font-Jakarta text-sm text-secondary-500">
                {driverVehicleLabel(driver)}
              </Text>
              {driver.carPlate && (
                <>
                  <View className="h-3 w-px bg-general-300" />
                  <Text className="font-Jakarta-SemiBold text-sm text-secondary-700">
                    {driver.carPlate}
                  </Text>
                </>
              )}
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1">
              <AppImage
                source={require("@/assets/icons/star.png")}
                className="size-3"
              />
              <Text className="font-Jakarta-Bold text-xs text-primary-600">
                {driverRating(driver)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Route Card ──────────────────────────── */}
        <View
          className="gap-3 rounded-2xl bg-general-500 px-4 py-4"
        >
          <View className="flex-row items-start gap-3">
            <View className="items-center gap-1 pt-0.5">
              <View className="size-2 rounded-full bg-secondary-900" />
              <View className="h-8 w-px bg-general-300" />
              <View className="size-2 rounded-full bg-green-500" />
            </View>
            <View className="flex-1 gap-4">
              <Text
                className="font-Jakarta-SemiBold text-sm text-secondary-800"
                numberOfLines={2}
              >
                {origin?.address || "Current location"}
              </Text>
              <Text
                className="font-Jakarta text-sm text-secondary-500"
                numberOfLines={2}
              >
                {destination?.address || "Selected destination"}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Trip Stats ──────────────────────────── */}
        <View className="flex-row gap-3">
          <StatCard
            label="Price"
            value={`$${formatFare(driverFare(driver))}`}
            highlight
          />
          <StatCard
            label="Pickup"
            value={`${driverEtaMinutes(driver)} min`}
          />
          <StatCard
            label="Seats"
            value={String(driverSeats(driver))}
          />
        </View>
      </View>

      {/* ── Confirm CTA ─────────────────────────── */}
      <View className="px-5 pt-4">
        <AppButton
          title="Confirm Ride"
          onPress={onConfirm}
          loading={confirmLoading}
        />
      </View>
    </View>
  );
}
