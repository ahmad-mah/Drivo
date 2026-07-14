import { useAuth } from "@clerk/expo";
import { useCallback } from "react";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:3000";

export function useApi() {
  const { getToken, signOut } = useAuth();

  const apiClient = useCallback(
    async <T>(path: string, options?: RequestInit): Promise<T> => {
      const token = await getToken();

      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          await signOut();
        }
        const body = await res
          .json()
          .catch(() => ({ message: "Request failed" }));
        throw new Error(body.message ?? "Request failed");
      }

      return res.json() as Promise<T>;
    },
    [getToken, signOut],
  );

  return { apiClient };
}
