import { useCallback, useState } from "react";
import * as ridesApi from "@/api/rides/rides.api";
import { ApiError, getErrorMessage } from "@/errors";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import { goToRideStatus } from "@/shared/services/navigation";
import type { RidePoint } from "../types/ride.types";

/**
 * Submits the ride request and moves to the full-screen searching view on
 * success. The backend allows one active ride per user, so a 409 means a ride
 * is already in progress — we jump to it instead of failing the tap. Any other
 * failure surfaces as a snackbar rather than going silently ignored.
 */
export function useRideRequest() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useErrorSnackbar(error);

  const submit = useCallback(
    async (origin: RidePoint, destination: RidePoint) => {
      setSubmitting(true);
      setError(null);
      try {
        await ridesApi.requestRide({ origin, destination });
        goToRideStatus();
        return true;
      } catch (err) {
        if (err instanceof ApiError && err.statusCode === 409) {
          // One active ride allowed — a prior request is still in flight, so
          // show it instead of erroring out.
          goToRideStatus();
          return true;
        }
        setError(getErrorMessage(err, "Could not request a ride. Try again."));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { submitting, error, submit };
}