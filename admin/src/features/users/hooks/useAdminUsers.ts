import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminUsersApi, type UserListParams } from "../api/admin-users.api";

export function useAdminUsers() {
  const [filters, setFilters] = useState<UserListParams>({
    page: 1,
    limit: 25,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => adminUsersApi.list(filters),
    placeholderData: (prev) => prev,
  });

  const updateFilters = (patch: Partial<UserListParams>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: patch.page ?? 1 }));
  };

  return {
    users: data?.data ?? [],
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
