import { apiClient } from "../../../lib/api";
import type { ApiResponse, PaginatedResponse, AdminAuditLogEntry } from "../../../types/admin";

export const adminAuditApi = {
  list: async (params: { adminId?: string; action?: string; targetType?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<AdminAuditLogEntry>>>(
      "/api/admin/audit",
      { params },
    );
    return data.data;
  },
};
