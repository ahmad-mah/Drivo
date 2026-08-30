import { apiClient } from "../../../lib/api";
import type { ApiResponse, PaginatedResponse } from "../../../types/admin";

export interface AdminPromo {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  usageLimit: number | null;
  usageCount: number;
  validUntil: string | null;
  isActive: boolean;
  createdByName: string;
  createdAt: string;
}

export const adminPromosApi = {
  list: async (params: { page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<AdminPromo>>>(
      "/api/admin/promos",
      { params },
    );
    return data.data;
  },
  toggleActive: async (id: string, active: boolean) => {
    const { data } = await apiClient.put<ApiResponse<AdminPromo>>(
      `/api/admin/promos/${id}/toggle`,
      { active },
    );
    return data;
  },
};
