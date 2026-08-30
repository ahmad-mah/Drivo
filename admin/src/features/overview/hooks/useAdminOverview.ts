import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminOverviewApi } from "../api/admin-overview.api";
import { useAdminSocket } from "../../../lib/admin-socket";

export function useAdminOverview() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: adminOverviewApi.getOverview,
    refetchInterval: 15_000,
  });

  useAdminSocket({
    onRideUpdated: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
    onDriverStatus: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  return { overview: data, loading: isLoading, error };
}
