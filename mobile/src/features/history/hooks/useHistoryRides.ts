import { useCallback, useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import * as ridesApi from "@/api/rides/rides.api";
import { RIDE_COMPLETED_EVENT } from "@/features/home/hooks/useRides";
import { getErrorMessage } from "@/errors";
import type { Ride } from "@/features/rides/types/ride.types";

const PAGE_SIZE = 10;

/**
 * Full paginated history for the History tab: loads the first page on mount
 * and appends pages via `loadMore` (FlatList's onEndReached).
 */
export function useHistoryRides() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (offset: number, append: boolean) => {
    try {
      const page = await ridesApi.getRideHistory(PAGE_SIZE, offset);
      setRides((prev) => (append ? [...prev, ...page] : page));
      // A short page means the backend has nothing further.
      setHasMore(page.length === PAGE_SIZE);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load your ride history"));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const page = await ridesApi.getRideHistory(PAGE_SIZE, 0);
        if (cancelled) return;
        setRides(page);
        setHasMore(page.length === PAGE_SIZE);
      } catch (err) {
        if (cancelled) return;
        setError(getErrorMessage(err, "Failed to load your ride history"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Pull-to-refresh: reset to page 0 while preserving scroll position.
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadPage(0, false);
    setRefreshing(false);
  }, [loadPage]);

  // Auto-refetch when a ride is completed or rated anywhere in the app.
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(RIDE_COMPLETED_EVENT, () => {
      void loadPage(0, false);
    });
    return () => sub.remove();
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    await loadPage(rides.length, true);
    setLoadingMore(false);
  }, [loadingMore, hasMore, loading, rides.length, loadPage]);

  /**
   * Optimistically reflects a submitted rating on the local list — the API
   * call is handled by the caller (useSubmitRating).
   */
  const applyRating = (rideId: string, stars: number) => {
    setRides((prev) =>
      prev.map((ride) =>
        ride.id === rideId ? { ...ride, riderRating: stars } : ride,
      ),
    );
  };

  return { rides, loading, refreshing, loadingMore, hasMore, error, loadMore, refresh, applyRating };
}
