import { apiClient } from "../../../lib/api";
import type {
  ApiResponse,
  PaginatedResponse,
  AdminTripListItem,
  AdminTripDetail,
} from "../../../types/admin";

export interface TripListParams {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const adminTripsApi = {
  list: async (params: TripListParams = {}) => {
    const { data } = await apiClient.get<
      ApiResponse<PaginatedResponse<AdminTripListItem>>
    >("/api/admin/trips", { params });
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<AdminTripDetail>>(
      `/api/admin/trips/${id}`,
    );
    return data.data;
  },

  cancel: async (id: string, reason: string) => {
    const { data } = await apiClient.put<ApiResponse<AdminTripListItem>>(
      `/api/admin/trips/${id}/cancel`,
      { reason },
    );
    return data.data;
  },
};
