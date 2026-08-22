import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import type { DriverProfile, ApplyDriverDto } from "@/api/drivers/drivers.api";
import * as driversApi from "@/api/drivers/drivers.api";
import { DriverApprovalStatus } from "@/features/drivers/enums/DriverApprovalStatus";
import { ApiError, toError } from "@/errors";

type SubmitAction = (dto: ApplyDriverDto) => Promise<DriverProfile>;

export function useDriverApplication() {
  const [application, setApplication] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const runSubmission = useCallback(
    async (action: SubmitAction, dto: ApplyDriverDto) => {
      try {
        setSubmitting(true);
        setError(null);
        const result = await action(dto);
        setApplication(result);
        return true;
      } catch (err) {
        setError(toError(err, "Failed to submit application"));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [setSubmitting, setError, setApplication],
  );

  // Refetch on every focus so Home/Profile reflect the latest status (e.g. after
  // returning from the apply screen or after an admin approves/rejects).
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const fetchApplication = async () => {
        try {
          const result = await driversApi.getMyDriverApplication();
          if (cancelled) return;
          setApplication(result);
        } catch (err) {
          if (cancelled) return;
          if (err instanceof ApiError && err.statusCode === 404) {
            setApplication(null);
          } else {
            setError(toError(err, "Failed to fetch application"));
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      fetchApplication();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const apply = useCallback(
    (dto: ApplyDriverDto) => runSubmission(driversApi.applyDriver, dto),
    [runSubmission],
  );

  const updateApplication = useCallback(
    (dto: ApplyDriverDto) => runSubmission(driversApi.updateDriverApplication, dto),
    [runSubmission],
  );

  // Routes to apply or update based on current state — screens stay logic-free.
  // REJECTED → re-apply; APPROVED → vehicle change (drops back to PENDING).
  const submit = useCallback(
    (dto: ApplyDriverDto) =>
      application?.approvalStatus === DriverApprovalStatus.REJECTED ||
      application?.approvalStatus === DriverApprovalStatus.APPROVED
        ? updateApplication(dto)
        : apply(dto),
    [application?.approvalStatus, apply, updateApplication],
  );

  return { application, loading, submitting, error, submit };
}
