import { API_URL } from "@/constants/env";
import { create } from "axios";

export const apiClient = create({
  baseURL: API_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});
