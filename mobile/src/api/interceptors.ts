import { isCancel } from "axios";
import { apiClient } from "./client";
import { getAccessToken } from "./token-provider";
import {
  ApiError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@/errors";

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // token retrieval failed — request proceeds without auth
    if (__DEV__) {
      console.warn("[api] token retrieval failed — request proceeding unauthenticated", err);
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        return Promise.reject(new UnauthorizedError());
      }
      if (status === 403) {
        return Promise.reject(new ForbiddenError());
      }
      if (status === 404) {
        return Promise.reject(new NotFoundError());
      }
      if (status === 422) {
        return Promise.reject(
          new ValidationError(data?.errors ?? {}, data?.message ?? "Validation failed"),
        );
      }

      return Promise.reject(
        new ApiError(status, data?.message ?? "Something went wrong"),
      );
    }

    if (error.code === "ECONNABORTED") {
      return Promise.reject(new ApiError(0, "Request timed out"));
    }

    return Promise.reject(new ApiError(0, "Network error"));
  },
);
