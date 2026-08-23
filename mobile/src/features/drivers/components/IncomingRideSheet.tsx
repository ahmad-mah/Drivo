import { Text, View } from "react-native";
import { AppButton } from "@/shared/components";
import type { IncomingRideRequest } from "@/api/drivers/drivers.api";

const OFFER_TTL_SECONDS = 20;

interface IncomingRideSheetProps {
  request: IncomingRideRequest;
  secondsLeft: number;
  responding: boolean;
  onAccept: () => void;
  onReject: () => void;
}

function RouteRow({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className={`size-3 rounded-full ${color}`} />
      <Text
        className="flex-1 font-Jakarta text-sm text-secondary-700"
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export function IncomingRideSheet({
  request,
  secondsLeft,
  responding,
  onAccept,
  onReject,
}: IncomingRideSheetProps) {
  const progress = Math.min(1, Math.max(0, secondsLeft / OFFER_TTL_SECONDS));

  return (
    <View
      className="absolute inset-x-4 bottom-24 z-10 gap-4 rounded-3xl bg-white p-5"
      style={{
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 16,
        shadowOpacity: 0.2,
        elevation: 12,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="font-Jakarta-Bold text-lg text-secondary-900">
          New ride request
        </Text>
        <Text className="font-Jakarta-Bold text-sm text-primary-500">
          {secondsLeft}s
        </Text>
      </View>

      <View className="h-1.5 overflow-hidden rounded-full bg-general-300">
        <View
          className="h-full rounded-full bg-primary-500"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </View>

      <View className="gap-2">
        <RouteRow color="bg-secondary-900" label={request.originAddress} />
        <RouteRow color="bg-green-500" label={request.destinationAddress} />
      </View>

      <View className="h-px bg-general-300" />

      <View className="flex-row items-center justify-between">
        <Text className="font-Jakarta text-sm text-secondary-400">
          {request.etaMinutes} min to pickup · {request.tripDistanceKm.toFixed(1)} km trip
        </Text>
        <Text className="font-Jakarta-Bold text-lg text-secondary-900">
          ${request.fare.toFixed(2)}
        </Text>
      </View>

      <View className="gap-2">
        <AppButton
          title="Accept"
          onPress={onAccept}
          loading={responding}
          disabled={responding}
        />
        <AppButton
          title="Reject"
          variant="outline"
          onPress={onReject}
          disabled={responding}
        />
      </View>
    </View>
  );
}
