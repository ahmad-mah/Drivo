import { FlatList, Text, View } from "react-native";
import { useState } from "react";
import { goToHistoryTab } from "@/shared/services/navigation";
import { RecentRidesEmptyState } from "./RecentRidesEmptyState";
import { RatingSheet } from "./RatingSheet";
import { RideItem } from "./RideItem";
import { RideItemSkeleton } from "../skeletons/RideItemSkeleton";
import { useRides } from "../hooks/useRides";
import type { Ride } from "@/features/rides/types/ride.types";

const SKELETON_ROWS = [0, 1, 2];

export function HomeRidesList() {
  const { rides, loading, error, submitRating } = useRides();
  const [ratingTarget, setRatingTarget] = useState<Ride | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (rideId: string, stars: number, comment?: string) => {
    setSubmitting(true);
    void submitRating(rideId, stars, comment).finally(() => {
      setSubmitting(false);
      setRatingTarget(null);
    });
  };

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="font-Jakarta-Bold text-lg text-secondary-900">
          Recent rides
        </Text>
        {!loading && rides.length > 0 && (
          <Text
            onPress={goToHistoryTab}
            className="font-Jakarta-SemiBold text-sm text-primary-500"
          >
            See all
          </Text>
        )}
      </View>
      {loading ? (
        <View className="gap-3">
          {SKELETON_ROWS.map((key) => (
            <RideItemSkeleton key={key} />
          ))}
        </View>
      ) : error ? (
        <View className="items-center rounded-2xl bg-white px-4 py-8">
          <Text className="font-Jakarta text-sm text-secondary-400">
            Couldn&apos;t load your recent rides.
          </Text>
        </View>
      ) : rides.length === 0 ? (
        <RecentRidesEmptyState />
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RideItem item={item} onRate={setRatingTarget} />
          )}
          contentContainerClassName="gap-3 pb-24"
          scrollEnabled={false}
        />
      )}

      <RatingSheet
        ride={ratingTarget}
        submitting={submitting}
        onSubmit={handleSubmit}
        onClose={() => setRatingTarget(null)}
      />
    </View>
  );
}
