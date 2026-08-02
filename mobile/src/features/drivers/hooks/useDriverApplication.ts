import { useState, useEffect, useCallback } from "react";
import type { DriverProfile, ApplyDriverDto } from "@/api/drivers/drivers.api";
import * as driversApi from "@/api/drivers/drivers.api";
import { DriverApprovalStatus } from "@/features/drivers/enums/DriverApprovalStatus";
import { ApiError } from "@/errors";

type SubmitAction = (dto: ApplyDriverDto) => Promise<DriverProfile>;

async function runSubmission(
  action: SubmitAction,
  dto: ApplyDriverDto,
  setSubmitting: (v: boolean) => void,
  setError: (e: Error | null) => void,
  setApplication: (p: DriverProfile | null) => void,
) {
  try {
    setSubmitting(true);
    setError(null);
    const result = await action(dto);
    setApplication(result);
    return true;
  } catch (err) {
    setError(err instanceof Error ? err : new Error("Failed to submit application"));
    return false;
  } finally {
    setSubmitting(false);
  }
}

export function useDriverApplication() {
  const [application, setApplication] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
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
          setError(err instanceof Error ? err : new Error("Failed to fetch application"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchApplication();

    return () => {
      cancelled = true;
    };
  }, []);

  const apply = useCallback(
    (dto: ApplyDriverDto) =>
      runSubmission(driversApi.applyDriver, dto, setSubmitting, setError, setApplication),
    [],
  );

  const updateApplication = useCallback(
    (dto: ApplyDriverDto) =>
      runSubmission(
        driversApi.updateDriverApplication,
        dto,
        setSubmitting,
        setError,
        setApplication,
      ),
    [],
  );

  // Routes to apply or update based on current state — screens stay logic-free
  const submit = useCallback(
    (dto: ApplyDriverDto) =>
      application?.approvalStatus === DriverApprovalStatus.REJECTED
        ? updateApplication(dto)
        : apply(dto),
    [application?.approvalStatus, apply, updateApplication],
  );

  return { application, loading, submitting, error, submit };
}
