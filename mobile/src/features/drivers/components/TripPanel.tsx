import { useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton } from "@/shared/components";
import { RideStatus } from "@/features/rides/enums/RideStatus";
import type { Ride } from "@/features/rides/types/ride.types";
import { formatCountdown } from "@/shared/utils/format";
import {
  TRIP_PRIMARY_LABELS,
  TRIP_STATUS_HINTS,
  getPrimaryHandler,
} from "../constants/tripPanelConfig";
import { useTripTimers } from "../hooks/useTripTimers";
import { CancelTripDialog } from "./CancelTripDialog";
import { DriverTripSummaryDialog } from "./DriverTripSummaryDialog";

interface TripPanelProps {
  trip: Ride;
  acting: boolean;
  onArrive: () => void;
  onStart: () => void;
  onArrivedAtDestination: () => void;
  onComplete: () => void;
  /** Pre-trip: re-dispatches to the next driver. Mid-trip: aborts. */
  onCancel: () => void;
  onNoShow: () => void;
  /** Clears the completed trip so the availability footer comes back. */
  onDismissSummary: () => void;
}

/**
 * Driver-side trip control surface, shown in place of the availability
 * footer while a trip is active. The primary button advances the lifecycle
 * (arrive → start → complete). Cancel semantics are phase-aware:
 * pre-trip it re-dispatches (reason required); mid-trip it aborts behind a
 * confirmation dialog. Once arrived, a wait countdown leads to the
 * rider-no-show action.
 */
export function TripPanel({
  trip,
  acting,
  onArrive,
  onStart,
  onArrivedAtDestination,
  onComplete,
  onCancel,
  onNoShow,
  onDismissSummary,
}: TripPanelProps) {
  const insets = useSafeAreaInsets();
  const inProgress = trip.status === RideStatus.IN_PROGRESS;
  const tripEnded = trip.status === RideStatus.TRIP_ENDED;
  const arrived = trip.status === RideStatus.ARRIVED;
  const paymentPaid = trip.paymentStatus === "PAID";
  const [summaryDismissed, setSummaryDismissed] = useState(false);
  const { elapsedSeconds, noShowLeft, noShowReady } = useTripTimers(trip);

  const onPrimary = getPrimaryHandler(trip.status, {
    onArrive,
    onStart,
    onArrivedAtDestination,
    onComplete,
  });

  return (
    <>
      {trip.status !== RideStatus.COMPLETED && (
        <View
          className="absolute inset-x-4 bottom-24 z-10 gap-3 rounded-3xl bg-white p-5"
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
              Active trip
            </Text>
            <Text className="font-Jakarta-SemiBold text-sm text-primary-500">
              ${trip.fare}
            </Text>
          </View>

          <View className="gap-2">
            <View className="flex-row items-center gap-3">
              <View className="size-3 rounded-full bg-secondary-900" />
              <Text
                className="flex-1 font-Jakarta text-sm text-secondary-700"
                numberOfLines={1}
              >
                {trip.originAddress}
              </Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="size-3 rounded-full bg-green-500" />
              <Text
                className="flex-1 font-Jakarta text-sm text-secondary-700"
                numberOfLines={1}
              >
                {trip.destinationAddress}
              </Text>
            </View>
          </View>

          <View className="h-px bg-general-300" />

          {arrived && noShowLeft != null ? (
            <View className="gap-1.5">
              <Text className="font-Jakarta-Bold text-base text-secondary-900">
                Waiting for the rider · {formatCountdown(noShowLeft)}
              </Text>
              <View className="h-1.5 overflow-hidden rounded-full bg-general-300">
                <View
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${Math.round(
                      Math.max(
                        0,
                        Math.min(1, noShowLeft / (trip.noShowInSeconds || 1)),
                      ) * 100,
                    )}%`,
                  }}
                />
              </View>
            </View>
          ) : inProgress ? (
            <Text className="font-Jakarta-Bold text-base text-secondary-900">
              On trip · {formatCountdown(elapsedSeconds)}
            </Text>
          ) : tripEnded ? (
            <Text className="font-Jakarta-Bold text-base text-secondary-900">
              {paymentPaid
                ? "Payment confirmed — tap to complete"
                : "Waiting for rider to pay..."}
            </Text>
          ) : (
            <Text className="font-Jakarta text-xs text-secondary-400">
              {TRIP_STATUS_HINTS[trip.status] ?? ""}
            </Text>
          )}

          <AppButton
            title={TRIP_PRIMARY_LABELS[trip.status] ?? "Continue"}
            onPress={onPrimary}
            loading={acting}
            disabled={acting || (tripEnded && !paymentPaid)}
          />

          {noShowReady && (
            <AppButton
              title="Rider didn't show up"
              onPress={onNoShow}
              loading={acting}
              disabled={acting}
            />
          )}

          <CancelTripDialog
            inProgress={inProgress}
            acting={acting}
            onCancel={onCancel}
          />
          <View style={{ height: Math.max(0, insets.bottom - 16) }} />
        </View>
      )}

      <DriverTripSummaryDialog
        trip={trip}
        visible={trip.status === RideStatus.COMPLETED && !summaryDismissed}
        onDone={() => {
          setSummaryDismissed(true);
          onDismissSummary();
        }}
      />
    </>
  );
}
