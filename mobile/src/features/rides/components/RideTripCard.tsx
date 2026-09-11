import { useState } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton, AppImage, AppTextInput } from "@/shared/components";
import type { Ride } from "../types/ride.types";
import { useRideTripCard } from "../hooks/useRideTripCard";
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
  onPay?: () => void;
  paying?: boolean;
}

export function RideTripCard({
  ride,
  onRequestCancel,
  cancelling = false,
  onRequestHelp,
  onRate,
  ratingSubmitting = false,
  alreadyRated = false,
  onDone,
  onPay,
  paying = false,
}: RideTripCardProps) {
  const insets = useSafeAreaInsets();
  const {
    inProgress,
    tripEnded,
    completed,
    needsRating,
    showCountdown,
    noShowLeft,
    accentBg,
    accentIcon,
    title,
    driverName,
    riderName,
    riderImageUrl,
    fare,
    statusLine,
  } = useRideTripCard(ride, alreadyRated);

  const [stars, setStars] = useState<number | null>(null);
  const [comment, setComment] = useState("");

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
          imageUrl={riderImageUrl}
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
        ) : tripEnded ? (
          <View className="gap-2.5">
            <View className="flex-row items-center justify-between rounded-xl border border-general-300 bg-white px-4 py-3">
              <Text className="font-Jakarta text-base text-secondary-700">
                Trip fare
              </Text>
              <Text className="font-Jakarta-Bold text-lg text-secondary-900">
                {fare}
              </Text>
            </View>
            {ride.paymentStatus === "PAID" ? (
              <View className="items-center gap-1 rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
                <Text className="font-Jakarta-SemiBold text-base text-green-700">
                  Payment confirmed
                </Text>
              </View>
            ) : (
              <AppButton
                title="Pay now"
                onPress={() => onPay?.()}
                loading={paying}
                disabled={paying}
              />
            )}
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
        ) : tripEnded ? (
          <AppButton title="Need help?" variant="outline" onPress={onRequestHelp} />
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
