import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton, AppImage } from "@/shared/components";
import { formatFare } from "@/shared/utils/format";
import type { Ride } from "../types/ride.types";

interface RideDriverAssignedCardProps {
  ride: Ride;
  onCancel: () => void;
  cancelling: boolean;
}

export function RideDriverAssignedCard({
  ride,
  onCancel,
  cancelling,
}: RideDriverAssignedCardProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="gap-4 rounded-t-4xl bg-white px-5 pt-6"
      style={{
        paddingBottom: insets.bottom + 24,
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 16,
        shadowOpacity: 0.15,
        elevation: 8,
      }}
    >
      <View className="flex-row items-center gap-3">
        <View className="rounded-full bg-green-500 p-3">
          <AppImage
            source={require("@/assets/icons/marker.png")}
            className="size-5"
            tintColor="#FFFFFF"
          />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="font-Jakarta-Bold text-xl text-secondary-900">
            Driver is on the way
          </Text>
          <Text
            className="font-Jakarta text-sm text-secondary-400"
            numberOfLines={1}
          >
            {ride.destinationAddress}
          </Text>
        </View>
      </View>

      <View className="h-px bg-general-300" />

      <View className="flex-row items-center gap-4">
        <View className="size-14 items-center justify-center rounded-full bg-gray-100">
          {ride.driverImageUrl ? (
            <AppImage
              source={{ uri: ride.driverImageUrl }}
              className="size-14 rounded-full"
            />
          ) : (
            <Text className="font-Jakarta-Bold text-2xl text-secondary-500">
              {ride.driverFirstName?.[0]}
              {ride.driverLastName?.[0]}
            </Text>
          )}
        </View>
        <View className="flex-1 gap-1">
          <Text className="font-Jakarta-Bold text-lg text-secondary-900">
            {ride.driverFirstName} {ride.driverLastName}
          </Text>
          <Text className="font-Jakarta text-sm text-secondary-400">
            {ride.driverVehicleModel} · {ride.driverVehicleColor} · {ride.driverCarPlate}
          </Text>
          {ride.driverRating != null && (
            <Text className="font-Jakarta text-xs text-secondary-400">
              ★ {ride.driverRating.toFixed(1)}
            </Text>
          )}
        </View>
      </View>

      <View className="h-px bg-general-300" />

      <View className="flex-row items-center justify-between">
        <Text className="font-Jakarta text-sm text-secondary-400">
          {ride.driverEtaMinutes != null
            ? `${ride.driverEtaMinutes} min away`
            : "Arriving soon"}
        </Text>
        <Text className="font-Jakarta-Bold text-lg text-secondary-900">
          ${formatFare(ride.fare)}
        </Text>
      </View>

      <AppButton
        title="Cancel ride"
        variant="outline"
        onPress={onCancel}
        loading={cancelling}
      />
    </View>
  );
}
