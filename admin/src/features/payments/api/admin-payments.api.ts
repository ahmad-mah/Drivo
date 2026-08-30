import { apiClient } from "../../../lib/api";
import type { ApiResponse, PaginatedResponse, PayoutStatus } from "../../../types/admin";

export interface AdminPayout {
  id: string;
  driverId: string;
  driverName: string;
  periodStart: string;
  periodEnd: string;
  grossEarnings: number;
  commission: number;
  netAmount: number;
  status: PayoutStatus;
  paidAt: string | null;
  paymentRef: string | null;
  createdAt: string;
}

export const adminPaymentsApi = {
  list: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<AdminPayout>>>(
      "/api/admin/payments",
      { params },
    );
    return data.data;
  },
  updateStatus: async (id: string, status: string, paymentRef?: string) => {
    const { data } = await apiClient.put<ApiResponse<AdminPayout>>(
      `/api/admin/payments/${id}/status`,
      { status, paymentRef },
    );
    return data.data;
  },
};
