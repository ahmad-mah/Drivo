import { useCallback, useState } from "react";
import type { AdminDriver } from "../types/driver";

export function useRejectForm(
  onReject: (id: string, reason: string) => void,
) {
  const [target, setTarget] = useState<AdminDriver | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const openFor = useCallback((driver: AdminDriver) => {
    setTarget(driver);
    setReason("");
    setError(null);
  }, []);

  const close = useCallback(() => {
    setTarget(null);
    setReason("");
    setError(null);
  }, []);

  const submit = useCallback(() => {
    if (!target) return;
    if (!reason.trim()) {
      setError("A rejection reason is required");
      return;
    }
    onReject(target.id, reason.trim());
    close();
  }, [target, reason, onReject, close]);

  return { target, reason, setReason, error, openFor, close, submit };
}
