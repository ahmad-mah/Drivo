import { useCallback, useRef, useState } from "react";
import * as driversApi from "../api/admin-drivers.api";
import type { AdminDriver } from "../types/driver";

export function useDriverDetail() {
  const [target, setTarget] = useState<AdminDriver | null>(null);
  const [detail, setDetail] = useState<AdminDriver | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const load = useCallback(async (driverId: string) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    try {
      const result = await driversApi.getDriver(driverId);
      if (seq !== requestSeq.current) return;
      setDetail(result);
    } catch (err) {
      if (seq !== requestSeq.current) return;
      setError(err instanceof Error ? err.message : "Failed to load driver");
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, []);

  const openFor = useCallback(
    (driver: AdminDriver) => {
      setTarget(driver);
      setDetail(driver);
      setError(null);
      load(driver.id);
    },
    [load],
  );

  const refresh = useCallback(() => {
    if (!target) return;
    load(target.id);
  }, [target, load]);

  const close = useCallback(() => {
    requestSeq.current++;
    setTarget(null);
    setDetail(null);
    setError(null);
  }, []);

  return { target, detail, loading, error, openFor, refresh, close };
}
