import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  RefreshControl,
  SectionList,
  Text,
  UIManager,
  View,
  type ViewToken,
} from "react-native";
import { RatingSheet } from "@/features/home/components/RatingSheet";
import { RideItem } from "@/features/home/components/RideItem";
import { RecentRidesEmptyState } from "@/features/home/components/RecentRidesEmptyState";
import { RideItemSkeleton } from "@/features/home/skeletons/RideItemSkeleton";
import { RideStatus } from "@/features/rides/enums/RideStatus";
import type { Ride } from "@/features/rides/types/ride.types";
import { useHistoryRides } from "../hooks/useHistoryRides";
import { useSubmitRating } from "../hooks/useSubmitRating";
import { groupRidesByDate } from "../utils/groupRides";
import {
  HistoryFilterTabs,
  type RideFilter,
} from "../components/HistoryFilterTabs";
import { useTabBarBottomInset } from "@/shared/hooks/useTabBarBottomInset";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function matchesFilter(ride: Ride, filter: RideFilter): boolean {
  if (filter === "completed") return ride.status === RideStatus.COMPLETED;
  if (filter === "cancelled")
    return ride.status === RideStatus.CANCELLED || ride.status === RideStatus.EXPIRED;
  return true;
}

export function HistoryScreen() {
  const { rides, loading, refreshing, loadingMore, error, loadMore, refresh, applyRating } =
    useHistoryRides();
  const { submitting, submit } = useSubmitRating();
  const [filter, setFilter] = useState<RideFilter>("all");
  const [ratingTarget, setRatingTarget] = useState<null | Ride>(null);
  const tabBarInset = useTabBarBottomInset();

  /** IDs of items that have scrolled into view at least once — their map
   *  thumbnail is mounted and stays mounted (even if they scroll back out). */
  const [renderedIds, setRenderedIds] = useState<Set<string>>(() => new Set());

  // Derive effective rendered IDs during render to avoid cascading updates
  // Pre-populate first 8 to avoid the initial mount blank-map bug in SectionList
  const effectiveRenderedIds = useMemo(() => {
    const set = new Set(renderedIds);
    rides.slice(0, 8).forEach((r) => set.add(r.id));
    return set;
  }, [renderedIds, rides]);

  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: 20, minimumViewTime: 100 }),
    [],
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      let changed = false;
      setRenderedIds((prev) => {
        const next = new Set(prev);
        for (const vt of viewableItems) {
          if (vt.item && !next.has(vt.item.id)) {
            next.add(vt.item.id);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    },
    [],
  );

  const handleFilterChange = (next: RideFilter) => {
    if (next === filter) return;
    LayoutAnimation.configureNext({
      duration: 250,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setFilter(next);
  };

  const sections = useMemo(() => {
    const filtered = rides.filter((ride) => matchesFilter(ride, filter));
    return groupRidesByDate(filtered);
  }, [rides, filter]);

  const visibleCount = useMemo(
    () => sections.reduce((sum, section) => sum + section.data.length, 0),
    [sections],
  );

  const handleSubmit = (rideId: string, stars: number, comment?: string) => {
    void submit(rideId, stars, comment).then(() => {
      applyRating(rideId, stars);
      setRatingTarget(null);
    });
  };

  return (
    <View className="flex-1 bg-general-500 px-4 pt-14">
      <Text className="mb-1 font-Jakarta-Bold text-2xl text-secondary-900">
        Your rides
      </Text>
      <Text className="mb-4 font-Jakarta text-sm text-secondary-500">
        {loading
          ? "Loading..."
          : `${visibleCount} ride${visibleCount !== 1 ? "s" : ""}`}
      </Text>

      <HistoryFilterTabs active={filter} onChange={handleFilterChange} />

      {loading ? (
        <View className="gap-3">
          {[0, 1, 2].map((key) => (
            <RideItemSkeleton key={key} />
          ))}
        </View>
      ) : error ? (
        <View className="items-center rounded-2xl bg-white px-4 py-8">
          <Text className="font-Jakarta text-sm text-secondary-400">
            {error}
          </Text>
        </View>
      ) : visibleCount === 0 ? (
        <View className="mt-8">
          <RecentRidesEmptyState />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.4}
          contentContainerStyle={{ paddingBottom: tabBarInset }}
          stickySectionHeadersEnabled={false}
          removeClippedSubviews={Platform.OS === "android"}
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <RideItem
              item={item}
              onRate={setRatingTarget}
              isInView={effectiveRenderedIds.has(item.id)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <Text className="mb-2 font-Jakarta-Bold text-sm text-secondary-500">
              {section.title}
            </Text>
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor="#1e3a5f"
              colors={["#1e3a5f"]}
            />
          }
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4">
                <ActivityIndicator size="small" color="#1e3a5f" />
              </View>
            ) : null
          }
        />
      )}

      {ratingTarget && (
        <RatingSheet
          ride={ratingTarget}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => setRatingTarget(null)}
        />
      )}
    </View>
  );
}
