import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";

export interface PayForRideResult {
  alreadyPaid: boolean;
  clientSecret: string | null;
  stripeCustomerId: string | null;
  ephemeralKeySecret: string | null;
}

/** Called when the driver taps "Arrived at Destination". Returns a clientSecret for the payment sheet. */
export async function payForRide(rideId: string) {
  const { data } = await apiClient.post<ApiResponse<PayForRideResult>>(
    "/api/payments/pay-for-ride",
    { rideId },
  );
  return data.data;
}

/** Polls ride payment status (used by rider after payment sheet is dismissed). */
export async function getRidePaymentStatus(rideId: string) {
  const { data } = await apiClient.get<
    ApiResponse<{ paymentStatus: string | null; status: string }>
  >(`/api/payments/payment-status/${rideId}`);
  return data.data;
}
