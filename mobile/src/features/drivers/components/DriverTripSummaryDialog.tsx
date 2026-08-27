import { Text, View } from "react-native";
import { AppButton, AppDialog } from "@/shared/components";
import type { Ride } from "@/features/rides/types/ride.types";

interface DriverTripSummaryDialogProps {
  trip: Ride;
  visible: boolean;
  onDone: () => void;
}

function formatFare(trip: Ride) {
  const earned = (trip.driverFare ?? Number(trip.fare)) || 0;
  const amount = earned.toFixed(2);
  return trip.currency === "USD" ? `$${amount}` : `${amount} ${trip.currency}`;
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-Jakarta text-sm text-secondary-500">{label}</Text>
      <Text
        className={
          highlight
            ? "font-Jakarta-Bold text-base text-success-600"
            : "font-Jakarta-SemiBold text-base text-secondary-900"
        }
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * Centered post-trip summary shown to the driver the moment the ride flips
 * to COMPLETED. Replaces the control panel so the driver's only action is
 * acknowledging the run (onDone clears the trip back to availability).
 */
export function DriverTripSummaryDialog({
  trip,
  visible,
  onDone,
}: DriverTripSummaryDialogProps) {
  return (
    <AppDialog visible={visible} onClose={onDone} dismissOnBackdrop={false}>
      <View className="w-full items-center gap-4">
        <View className="size-16 items-center justify-center rounded-full bg-success-100">
          <Text className="text-3xl font-Jakarta-Bold text-success-600">✓</Text>
        </View>

        <View className="gap-1">
          <Text className="text-center font-Jakarta-Bold text-xl text-secondary-900">
            Trip completed
          </Text>
          <Text className="text-center font-Jakarta text-sm text-secondary-500">
            Here&apos;s your ride summary
          </Text>
        </View>

        <View className="w-full gap-3 rounded-2xl bg-general-500 p-4">
          <SummaryRow label="Fare earned" value={formatFare(trip)} highlight />
          <SummaryRow
            label="Distance"
            value={`${trip.distanceKm.toFixed(1)} km`}
          />
          <SummaryRow label="Duration" value={`${trip.rideTimeMinutes} min`} />
          {trip.riderRating != null && (
            <SummaryRow
              label="Your rating"
              value={`★ ${trip.riderRating.toFixed(1)}`}
            />
          )}
        </View>

        <View className="w-full gap-1">
          <Text className="font-Jakarta text-xs text-secondary-400">From</Text>
          <Text
            className="font-Jakarta text-sm text-secondary-700"
            numberOfLines={1}
          >
            {trip.originAddress}
          </Text>
          <Text className="mt-2 font-Jakarta text-xs text-secondary-400">To</Text>
          <Text
            className="font-Jakarta text-sm text-secondary-700"
            numberOfLines={1}
          >
            {trip.destinationAddress}
          </Text>
        </View>

        <AppButton title="Done" onPress={onDone} />
      </View>
    </AppDialog>
  );
}
