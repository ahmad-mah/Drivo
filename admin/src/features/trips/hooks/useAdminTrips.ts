import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminTripsApi, type TripListParams } from "../api/admin-trips.api";

export function useAdminTrips() {
  const [filters, setFilters] = useState<TripListParams>({
    page: 1,
    limit: 25,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "trips", filters],
    queryFn: () => adminTripsApi.list(filters),
    placeholderData: (prev) => prev,
  });

  const updateFilters = (patch: Partial<TripListParams>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  };

  return {
    trips: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 0,
    loading: isLoading,
    error,
    filters,
    updateFilters,
    refetch,
  };
}
