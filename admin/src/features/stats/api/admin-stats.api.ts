import { apiClient } from "../../../lib/api";
import type { ApiResponse } from "../../../types/admin";

export interface StatsSummary {
  totalUsers: number;
  totalDrivers: number;
  pendingApprovals: number;
  onlineDrivers: number;
  totalRides: number;
  completedRides: number;
  cancelledRides: number;
  completionRate: number;
  totalRevenue: number;
}

export interface DailyStat {
  date: string;
  rides: number;
  revenue: number;
  completed: number;
}

export interface TopDriverStat {
  id: string;
  name: string;
  trips: number;
  earnings: number;
}

export interface StatusDistItem {
  status: string;
  count: number;
}

export interface AdminStatsResponse {
  summary: StatsSummary;
  daily: DailyStat[];
  topDrivers: TopDriverStat[];
  statusDistribution: StatusDistItem[];
}

export const adminStatsApi = {
  get: async (dateFrom?: string, dateTo?: string) => {
    const { data } = await apiClient.get<ApiResponse<AdminStatsResponse>>(
      "/api/admin/stats",
      { params: { dateFrom, dateTo } },
    );
    return data.data;
  },
};
