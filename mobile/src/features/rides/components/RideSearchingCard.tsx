import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { AppButton, AppImage } from "@/shared/components";
import { formatFare } from "@/shared/utils/format";
import type { Ride } from "../types/ride.types";

interface RideSearchingCardProps {
  ride: Ride;
  onCancel: () => void;
  cancelling: boolean;
}

function formatTimeLeft(expiresAt: string) {
  const now = Date.now();
  const expiry = new Date(expiresAt).getTime();
  const diff = Math.max(0, Math.ceil((expiry - now) / 1000));
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function RideSearchingCard({
  ride,
  onCancel,
  cancelling,
}: RideSearchingCardProps) {
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(ride.expiresAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(formatTimeLeft(ride.expiresAt));
    }, 1000);
    return () => clearInterval(timer);
  }, [ride.expiresAt]);

  return (
    <View
      className="gap-4 rounded-t-4xl bg-white px-5 pt-6 pb-8"
      style={{
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
            I&apos;m requesting a ride.
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
      <View className="flex-row items-center justify-between">
        <Text className="font-Jakarta text-sm text-secondary-400">
          {ride.nearbyDrivers} driver{ride.nearbyDrivers === 1 ? "" : "s"}{" "}
          nearby
        </Text>
        <Text className="font-Jakarta text-sm text-secondary-400">
          Expires in {timeLeft}
        </Text>
      </View>
      <View className="h-px bg-general-300" />
      <View className="flex-row items-center justify-between">
        <Text className="font-Jakarta text-sm text-secondary-400">
          Fare
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