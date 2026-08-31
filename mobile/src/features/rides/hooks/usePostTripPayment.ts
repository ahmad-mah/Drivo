import { useCallback, useState } from "react";
import { payForRide, getRidePaymentStatus } from "../api/payments.api";
import { useStripePayment } from "./useStripePayment";
import { RidePaymentStatus } from "../enums/RideStatus";

/**
 * Post-trip payment hook. Triggered when the rider sees the payment sheet
 * after the driver signals arrival at destination.
 *
 * Flow:
 * 1. Driver taps "Arrived at Destination" → backend creates PI → rider gets payment sheet
 * 2. First ride: enter full card info (card saved for future)
 * 3. Returning ride: enter CVV only (card pre-filled)
 * 4. Webhook confirms payment → ride paymentStatus = PAID → driver can complete
 */
export function usePostTripPayment(rideId: string | null) {
  const {
    initAndPresentPayment,
    loading: paymentSheetLoading,
    error: paymentError,
    setError: setPaymentError,
  } = useStripePayment();
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"paid" | "canceled" | "error" | null>(
    null,
  );

  /**
   * Call this when the ride enters TRIP_ENDED status.
   * Creates the PI and presents the payment sheet.
   */
  const startPostTripPayment = useCallback(async () => {
    if (!rideId) return;
    setSubmitting(true);
    setResult(null);
    try {
      const data = await payForRide(rideId);

      if (data.alreadyPaid) {
        setResult("paid");
        return;
      }

      if (!data.clientSecret) {
        setResult("error");
        setPaymentError("No payment secret received");
        return;
      }

      const paymentResult = await initAndPresentPayment(
        data.clientSecret,
        true, // cvvRecollection — returning rider, card pre-filled
      );

      if (paymentResult?.success) {
        setResult("paid");
      } else {
        setResult("canceled");
      }
    } catch (err) {
      setResult("error");
      setPaymentError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }, [rideId, initAndPresentPayment, setPaymentError]);

  /**
   * Polls the payment status from the backend (after webhook confirms).
   * Use this if the payment sheet was dismissed but we need to verify.
   */
  const checkPaymentStatus = useCallback(async (): Promise<RidePaymentStatus | null> => {
    if (!rideId) return null;
    try {
      const data = await getRidePaymentStatus(rideId);
      return data.paymentStatus as RidePaymentStatus | null;
    } catch {
      return null;
    }
  }, [rideId]);

  return {
    startPostTripPayment,
    checkPaymentStatus,
    submitting: submitting || paymentSheetLoading,
    paymentError,
    result,
  };
}
