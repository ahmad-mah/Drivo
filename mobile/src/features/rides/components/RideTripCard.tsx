import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton, AppImage, AppTextInput } from "@/shared/components";
import { formatFare } from "@/shared/utils/format";
import { RideStatus } from "../enums/RideStatus";
import { TRIP_TITLES } from "../constants/tripCardConfig";
import type { Ride, RidePoint } from "../types/ride.types";
import { useUserContext } from "@/providers/UserProvider";
import { useLiveEta } from "../hooks/useLiveEta";
import { NoShowCountdown } from "./NoShowCountdown";
import { ParticipantCard } from "./ParticipantCard";
import { StarRatingInput } from "./StarRatingInput";

interface RideTripCardProps {
  ride: Ride;
  onRequestCancel: () => void;
  cancelling?: boolean;
  onRequestHelp: () => void;
  onRate: (stars: number, comment?: string) => void;
  ratingSubmitting?: boolean;
  alreadyRated?: boolean;
  onDone: () => void;
}

const STATUS_ICONS: Record<string, number> = {
  [RideStatus.ACCEPTED]: require("@/assets/icons/point.png"),
  [RideStatus.ARRIVED]: require("@/assets/icons/check.png"),
  [RideStatus.IN_PROGRESS]: require("@/assets/icons/marker.png"),
  [RideStatus.COMPLETED]: require("@/assets/icons/check.png"),
};

const STATUS_BG: Record<string, string> = {
  [RideStatus.ACCEPTED]: "bg-primary-500",
  [RideStatus.ARRIVED]: "bg-green-500",
  [RideStatus.IN_PROGRESS]: "bg-primary-500",
  [RideStatus.COMPLETED]: "bg-primary-500",
};

export function RideTripCard({
  ride,
  onRequestCancel,
  cancelling = false,
  onRequestHelp,
  onRate,
  ratingSubmitting = false,
  alreadyRated = false,
  onDone,
}: RideTripCardProps) {
  const insets = useSafeAreaInsets();
  const { user } = useUserContext();
  const inProgress = ride.status === RideStatus.IN_PROGRESS;
  const completed = ride.status === RideStatus.COMPLETED;
  const needsRating = completed && ride.riderRating == null && !alreadyRated;
  const [stars, setStars] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  // No-show countdown: anchored from the server arrival timestamp
  // (arrivedAt + noShowInSeconds) so rider and driver stay in sync, and the
  // remaining seconds are *derived* each render from a `now` tick — never
  // stored via setState in an effect body — so the timer ticks without
  // cascading synchronous re-renders.
  const noShowDeadline = useMemo(() => {
    if (ride.arrivedAt == null || ride.noShowInSeconds == null) return null;
    return new Date(ride.arrivedAt).getTime() + ride.noShowInSeconds * 1000;
  }, [ride.arrivedAt, ride.noShowInSeconds]);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (noShowDeadline == null || inProgress || completed) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    const raf = requestAnimationFrame(() => setNow(Date.now()));
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(raf);
    };
  }, [noShowDeadline, inProgress, completed]);

  const noShowLeft =
    noShowDeadline != null ? Math.max(0, (noShowDeadline - now) / 1000) : null;

  const showCountdown = noShowDeadline != null && ride.status === RideStatus.ARRIVED;

  const accentBg = STATUS_BG[ride.status] ?? "bg-primary-500";
  const accentIcon = STATUS_ICONS[ride.status] ?? STATUS_ICONS[RideStatus.ACCEPTED];
  const title = completed ? "Trip completed" : TRIP_TITLES[ride.status];

  const driverName =
    [ride.driverFirstName, ride.driverLastName].filter(Boolean).join(" ") ||
    "Your driver";
  const riderName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "You";

  const fare = `$${formatFare(ride.fare)}`;

  const destination: RidePoint | null = useMemo(
    () =>
      inProgress
        ? {
            address: ride.destinationAddress,
            latitude: ride.destinationLatitude,
            longitude: ride.destinationLongitude,
          }
        : null,
    [inProgress, ride.destinationAddress, ride.destinationLatitude, ride.destinationLongitude],
  );

  const { etaMinutes: liveEta, loading: etaLoading } = useLiveEta(destination, inProgress);

  const statusLine = completed
    ? "Thanks for riding with Drivo"
    : inProgress
      ? liveEta != null
        ? `Arriving in ${liveEta} min`
        : etaLoading
          ? "Calculating ETA..."
          : "Heading to your destination"
      : ride.driverEtaMinutes != null
        ? `${ride.driverEtaMinutes} min away`
        : "Arriving soon";

  return (
    <View
      className="rounded-t-4xl bg-white px-5 pt-6"
      style={{
        paddingBottom: insets.bottom + 24,
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 12,
        shadowOpacity: 0.08,
        elevation: 8,
      }}
    >
      {/* ── Status Hero ──────────────────────────── */}
      <View className="items-center gap-3 pb-5">
        <View className={`size-16 items-center justify-center rounded-full ${accentBg}`}>
          <AppImage source={accentIcon} className="size-7" tintColor="#FFFFFF" />
        </View>
        <View className="items-center gap-1">
          <Text className="font-Jakarta-Bold text-2xl text-secondary-900">
            {title}
          </Text>
          <Text
            className="font-Jakarta text-base text-secondary-700"
            numberOfLines={1}
          >
            {ride.destinationAddress}
          </Text>
        </View>
      </View>

      {/* ── Participants ─────────────────────────── */}
      <View className="gap-2.5">
        <ParticipantCard
          role="Driver"
          name={driverName}
          imageUrl={ride.driverImageUrl}
          rating={ride.driverRating}
        />
        <ParticipantCard
          role="You"
          name={riderName}
          imageUrl={user?.imageUrl ?? null}
        />
      </View>

      {/* ── State block ──────────────────────────── */}
      <View className="mt-3">
        {showCountdown ? (
          <View className="rounded-2xl border border-general-300 bg-white p-3.5">
            <NoShowCountdown
              secondsLeft={noShowLeft ?? 0}
              totalSeconds={ride.noShowInSeconds ?? 0}
            />
          </View>
        ) : completed ? (
          <View className="gap-2.5">
            <View className="flex-row items-center justify-between rounded-xl border border-general-300 bg-white px-4 py-3">
              <Text className="font-Jakarta text-base text-secondary-700">
                Trip fare
              </Text>
              <Text className="font-Jakarta-Bold text-lg text-secondary-900">
                {fare}
              </Text>
            </View>
            {needsRating ? (
              <View className="gap-3 rounded-2xl border border-general-300 bg-white p-4">
                <Text className="font-Jakarta-SemiBold text-base text-secondary-900">
                  Rate your driver
                </Text>
                <StarRatingInput value={stars} onChange={setStars} />
                {stars != null && (
                  <AppTextInput
                    placeholder="Add a comment (optional)"
                    value={comment}
                    onChangeText={setComment}
                    maxLength={300}
                  />
                )}
                <AppButton
                  title="Submit rating"
                  disabled={stars == null}
                  loading={ratingSubmitting}
                  onPress={() => stars != null && onRate(stars, comment || undefined)}
                />
              </View>
            ) : (
              <View className="items-center gap-1 rounded-2xl border border-general-300 bg-white px-4 py-4">
                <Text className="font-Jakarta text-base text-secondary-700">
                  {ride.riderRating != null ? "You rated this trip" : "Trip finished"}
                </Text>
                {ride.riderRating != null && (
                  <Text className="font-Jakarta-Bold text-lg text-secondary-900">
                    ★ {ride.riderRating.toFixed(1)}
                  </Text>
                )}
              </View>
            )}
          </View>
        ) : (
          <View className="flex-row items-center justify-between rounded-xl border border-general-300 bg-white px-4 py-3">
            <Text className="font-Jakarta text-base text-secondary-700">
                {statusLine}
              </Text>
            <Text className="font-Jakarta-Bold text-lg text-secondary-900">
              {fare}
            </Text>
          </View>
        )}
      </View>

      {/* ── CTA ──────────────────────────────────── */}
      <View className="mt-4">
        {completed ? (
          !needsRating && <AppButton title="Done" onPress={onDone} />
        ) : inProgress ? (
          <AppButton title="Need help?" variant="outline" onPress={onRequestHelp} />
        ) : (
          <AppButton
            title="Cancel ride"
            variant="danger"
            onPress={onRequestCancel}
            loading={cancelling}
          />
        )}
      </View>
    </View>
  );
}
