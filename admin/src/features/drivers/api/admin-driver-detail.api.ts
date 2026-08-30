import { apiClient } from "../../../lib/api";
import type { ApiResponse, AdminDriverDetail } from "../../../types/admin";

export const adminDriversApi = {
  getDetail: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<AdminDriverDetail>>(
      `/api/admin/drivers/${id}/detail`,
    );
    return data.data;
  },
};
