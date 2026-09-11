import { useCallback, useState } from "react";
import * as ridesApi from "@/api/rides/rides.api";

/**
 * Encapsulates the async rating submission workflow: submits the rating to
 * the API and exposes the in-flight state so the UI can show a spinner.
 */
export function useSubmitRating() {
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(
    async (rideId: string, stars: number, comment?: string) => {
      setSubmitting(true);
      try {
        await ridesApi.rateRide(rideId, { stars, comment });
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return { submitting, submit };
}
