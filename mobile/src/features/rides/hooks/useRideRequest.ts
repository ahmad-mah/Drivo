import { useCallback, useState } from "react";
import * as ridesApi from "@/api/rides/rides.api";
import { ApiError, getErrorMessage } from "@/errors";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import type { RidePoint } from "../types/ride.types";

/**
 * Submits the ride request. The caller provides an `onSuccess` callback
 * that transitions the UI (e.g. switches to the searching sheet) — this
 * hook never navigates on its own. A 409 means a ride is already active;
 * the callback is still fired so the UI can show it.
 */
export function useRideRequest() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ride, setRide] = useState<import("../types/ride.types").Ride | null>(null);

  useErrorSnackbar(error);

  const submit = useCallback(
    async (
      origin: RidePoint,
      destination: RidePoint,
      onSuccess?: () => void,
    ) => {
      setSubmitting(true);
      setError(null);
      setRide(null);
      try {
        const result = await ridesApi.requestRide({ origin, destination });
        setRide(result);
        onSuccess?.();
        return result;
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 409) {
          onSuccess?.();
          return null;
        }
        setError(getErrorMessage(err, "Could not request a ride. Try again."));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { submitting, error, ride, submit };
}
