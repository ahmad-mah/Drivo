import { apiClient } from "../../../lib/api";
import type { ApiResponse, PaginatedResponse, TicketStatus } from "../../../types/admin";

export interface AdminTicket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: string;
  rideId: string | null;
  userName: string;
  assignedName: string | null;
  createdAt: string;
}

export interface AdminTicketDetail extends AdminTicket {
  description: string;
  user: { id: string; firstName: string; lastName: string; email: string; phone: string | null } | null;
  assignedTo: { firstName: string; lastName: string } | null;
  updatedAt: string;
}

export const adminSupportApi = {
  list: async (params: { status?: string; page?: number; limit?: number } = {}) => {
    const { data } = await apiClient.get<ApiResponse<PaginatedResponse<AdminTicket>>>(
      "/api/admin/support",
      { params },
    );
    return data.data;
  },
  getById: async (id: string) => {
    const { data } = await apiClient.get<ApiResponse<AdminTicketDetail>>(
      `/api/admin/support/${id}`,
    );
    return data.data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await apiClient.put<ApiResponse<AdminTicket>>(
      `/api/admin/support/${id}/status`,
      { status },
    );
    return data.data;
  },
};
