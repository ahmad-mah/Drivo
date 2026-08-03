import { useCallback, useEffect, useState } from "react";
import * as driversApi from "../api/admin-drivers.api";
import type {
  AdminDriver,
  DriverApprovalStatus as Status,
} from "../types/driver";

export function useAdminDrivers() {
  const [status, setStatus] = useState<Status | undefined>(undefined);
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchDrivers = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await driversApi.listDrivers(status);
        if (!cancelled) setDrivers(result);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load drivers");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDrivers();

    return () => {
      cancelled = true;
    };
  }, [status]);

  const reload = useCallback(async () => {
    setActionError(null);
    try {
      const result = await driversApi.listDrivers(status);
      setDrivers(result);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reload drivers");
    }
  }, [status]);

  const runAction = useCallback(
    async (action: () => Promise<AdminDriver>) => {
      setActionError(null);
      setBusy(true);
      try {
        await action();
        await reload();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Action failed");
      } finally {
        setBusy(false);
      }
    },
    [reload],
  );

  const approve = useCallback(
    (id: string) => runAction(() => driversApi.approveDriver(id)),
    [runAction],
  );

  const reject = useCallback(
    (id: string, reason: string) =>
      runAction(() => driversApi.rejectDriver(id, reason)),
    [runAction],
  );

  const suspend = useCallback(
    (id: string) => runAction(() => driversApi.suspendDriver(id)),
    [runAction],
  );

  const reinstate = useCallback(
    (id: string) => runAction(() => driversApi.reinstateDriver(id)),
    [runAction],
  );

  return {
    drivers,
    loading,
    error,
    actionError,
    busy,
    status,
    setStatus,
    approve,
    reject,
    suspend,
    reinstate,
  };
}
