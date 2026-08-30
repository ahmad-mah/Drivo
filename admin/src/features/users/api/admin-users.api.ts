import { apiClient } from "../../../lib/api";
import type { ApiResponse, PaginatedResponse } from "../../../types/admin";

export interface AdminUserListItem {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  imageUrl: string | null;
  role: string;
  createdAt: string;
  tripCount: number;
  ticketCount: number;
  hasDriverProfile: boolean;
  driverApprovalStatus: string | null;
}

export interface AdminUserDetail extends AdminUserListItem {
  stats: {
    totalTrips: number;
    completedTrips: number;
    totalSpent: number;
    ticketCount: number;
  };
  recentTrips: {
    id: string;
    status: string;
    originAddress: string;
    destinationAddress: string;
    fare: number;
    currency: string;
    createdAt: string;
    driverName: string | null;
  }[];
  recentTickets: {
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
  }[];
}

export interface UserListParams {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const adminUsersApi = {
  list: async (params: UserListParams = {}) => {
    const { data } = await apiClient.get<
      ApiResponse<PaginatedResponse<AdminUserListItem>>
    >("/api/admin/users", { params });
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<AdminUserDetail>>(
      `/api/admin/users/${id}`,
    );
    return data.data;
  },
};
