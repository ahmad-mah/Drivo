import { apiClient } from "../client";
import type { ApiResponse } from "../types";

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<ApiResponse<UserProfile>>("/api/users/me");
  return data.data;
}
