import { apiClient } from "../../../lib/api";
import type { ApiResponse, AdminOverviewResponse } from "../../../types/admin";

export const adminOverviewApi = {
  getOverview: async (): Promise<AdminOverviewResponse> => {
    const { data } = await apiClient.get<ApiResponse<AdminOverviewResponse>>(
      "/api/admin/overview",
    );
    return data.data;
  },
};
