import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton, AppDialog } from "@/shared/components";
import { RideStatus } from "@/features/rides/enums/RideStatus";
import type { Ride } from "@/features/rides/types/ride.types";
import {
  TRIP_PRIMARY_LABELS,
  TRIP_STATUS_HINTS,
} from "../constants/tripPanelConfig";
import { DriverTripSummaryDialog } from "./DriverTripSummaryDialog";

interface TripPanelProps {
  trip: Ride;
  acting: boolean;
  onArrive: () => void;
  onStart: () => void;
  onComplete: () => void;
  /** Pre-trip: re-dispatches to the next driver. Mid-trip: aborts. */
  onCancel: () => void;
  onNoShow: () => void;
  /** Clears the completed trip so the availability footer comes back. */
  onDismissSummary: () => void;
}

function formatCountdown(seconds: number) {
  const clamped = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
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
  onComplete,
  onCancel,
  onNoShow,
  onDismissSummary,
}: TripPanelProps) {
  const insets = useSafeAreaInsets();
  const inProgress = trip.status === RideStatus.IN_PROGRESS;
  const arrived = trip.status === RideStatus.ARRIVED;
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  // Wait countdown: deadline syncs when the status flips to ARRIVED —
  // capturing it at mount would freeze it to null (ACCEPTED sends no window).
  const [noShow, setNoShow] = useState<{
    deadline: number;
    total: number;
  } | null>(null);
  const [noShowLeft, setNoShowLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!arrived) return;
    if (rideNoShowSeconds(trip) == null) return;
    if (noShow) return;
    const total = rideNoShowSeconds(trip) as number;
    setNoShow({ deadline: Date.now() + total * 1000, total });
    setNoShowLeft(total);
  }, [arrived, trip, noShow]);

  useEffect(() => {
    if (!arrived || !noShow) return;
    const timer = setInterval(() => {
      setNoShowLeft(Math.max(0, (noShow.deadline - Date.now()) / 1000));
    }, 500);
    return () => clearInterval(timer);
  }, [arrived, noShow]);

  // Trip elapsed counter: same relative-capture pattern, counting UP.
  const elapsedBase = useRef(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    if (!inProgress) return;
    elapsedBase.current = trip.tripElapsedSeconds ?? 0;
    setElapsedSeconds(elapsedBase.current);
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [inProgress, trip]);

  const noShowReady = arrived && noShow != null && (noShowLeft ?? 0) <= 0;
  const [summaryDismissed, setSummaryDismissed] = useState(false);

  const onPrimary =
    trip.status === RideStatus.ACCEPTED
      ? onArrive
      : trip.status === RideStatus.ARRIVED
        ? onStart
        : onComplete;

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
                      Math.max(0, Math.min(1, noShowLeft / (noShow?.total || 1))) * 100,
                    )}%`,
                  }}
                />
              </View>
            </View>
          ) : inProgress ? (
            <Text className="font-Jakarta-Bold text-base text-secondary-900">
              On trip · {formatCountdown(elapsedSeconds)}
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
            disabled={acting}
          />

          {noShowReady && (
            <AppButton
              title="Rider didn't show up"
              onPress={onNoShow}
              loading={acting}
              disabled={acting}
            />
          )}

          <AppButton
            title={inProgress ? "Cancel trip" : "Cancel ride"}
            variant="danger"
            onPress={() => setConfirmingCancel(true)}
            disabled={acting}
          />
          <View style={{ height: Math.max(0, insets.bottom - 16) }} />
        </View>
      )}

      {/* Pre-trip cancel requires a reason; mid-trip abort confirms instead. */}
      <AppDialog visible={confirmingCancel} onClose={() => setConfirmingCancel(false)}>
        {inProgress ? (
          <>
            <Text className="text-center font-Jakarta-Bold text-lg text-secondary-900">
              Cancel this trip?
            </Text>
            <Text className="mt-2 text-center font-Jakarta text-sm text-secondary-500">
              The rider will be notified and the ride will end.
            </Text>
            <View className="mt-5 w-full gap-2">
              <AppButton
                title="Keep trip"
                onPress={() => setConfirmingCancel(false)}
              />
              <AppButton
                title="Cancel trip"
                variant="danger"
                loading={acting}
                disabled={acting}
                onPress={() => {
                  setConfirmingCancel(false);
                  onCancel();
                }}
              />
            </View>
          </>
        ) : (
          <>
            <Text className="text-center font-Jakarta-Bold text-lg text-secondary-900">
              Cancel this ride?
            </Text>
            <Text className="mt-2 text-center font-Jakarta text-sm text-secondary-500">
              It will be offered to the next nearest driver.
            </Text>
            <View className="mt-5 w-full gap-2">
              <AppButton
                title="Keep ride"
                onPress={() => setConfirmingCancel(false)}
              />
              <AppButton
                title="Cancel ride"
                variant="danger"
                loading={acting}
                disabled={acting}
                onPress={() => {
                  setConfirmingCancel(false);
                  onCancel();
                }}
              />
            </View>
          </>
        )}
      </AppDialog>

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

function rideNoShowSeconds(trip: Ride): number | null {
  return trip.noShowInSeconds ?? null;
}
