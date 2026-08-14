import { apiClient } from "../../../lib/api";
import {
  DriverApprovalStatus,
  type AdminDriver,
  type LiveDriver,
} from "../types/driver";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/** Initial REST paint for the live map before the socket snapshot arrives. */
export async function listLiveDrivers(): Promise<LiveDriver[]> {
  const { data } = await apiClient.get<ApiResponse<LiveDriver[]>>(
    "/api/admin/drivers/live",
  );
  return data.data;
}

export async function listDrivers(
  status?: DriverApprovalStatus,
): Promise<AdminDriver[]> {
  const { data } = await apiClient.get<ApiResponse<AdminDriver[]>>(
    "/api/admin/drivers",
    { params: status ? { status } : {} },
  );
  return data.data;
}

export async function getDriver(id: string): Promise<AdminDriver> {
  const { data } = await apiClient.get<ApiResponse<AdminDriver>>(
    `/api/admin/drivers/${id}`,
  );
  return data.data;
}

async function updateStatus(
  id: string,
  action: "approve" | "reject" | "suspend" | "reinstate",
  body?: { reason: string },
): Promise<AdminDriver> {
  const { data } = await apiClient.put<ApiResponse<AdminDriver>>(
    `/api/admin/drivers/${id}/${action}`,
    body,
  );
  return data.data;
}

export function approveDriver(id: string) {
  return updateStatus(id, "approve");
}

export function rejectDriver(id: string, reason: string) {
  return updateStatus(id, "reject", { reason });
}

export function suspendDriver(id: string) {
  return updateStatus(id, "suspend");
}

export function reinstateDriver(id: string) {
  return updateStatus(id, "reinstate");
}
