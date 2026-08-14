import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState } from "react-native";
import { API_URL } from "@/constants/env";

export type ConnectivityStatus =
  | "checking"
  | "online"
  | "server-down"
  | "no-internet";

interface ConnectivityContextValue {
  status: ConnectivityStatus;
  /** True only while a user-triggered retry probe is in flight (button spinner);
   *  background polls intentionally never flip it. */
  checking: boolean;
  retry: () => Promise<void>;
}

export const ConnectivityContext = createContext<ConnectivityContextValue | null>(null);

const API_PROBE_TIMEOUT_MS = 4_000;
const INTERNET_PROBE_TIMEOUT_MS = 4_000;
const RETRY_INTERVAL_MS = 5_000;
// Slower cadence while online so a connectivity drop can still be detected
// (e.g. the driver-mode auto-offline) without hammering the API every poll.
const ONLINE_PROBE_INTERVAL_MS = 10_000;

function timedSignal(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { controller, timer };
}

/**
 * True when the app's own API answers. Any HTTP response — 404 from the
 * not-found handler included — proves the server responded, so only a
 * transport failure or timeout counts as unreachable.
 */
async function isBackendReachable(): Promise<boolean> {
  const { controller, timer } = timedSignal(API_PROBE_TIMEOUT_MS);
  try {
    await fetch(`${API_URL}/`, { signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * True when general internet works, so an API failure can be blamed correctly.
 * Used only as a secondary signal: its result is ignored whenever the backend
 * answers, so a blocked Google endpoint can never defeat a healthy backend.
 */
async function isInternetReachable(): Promise<boolean> {
  const { controller, timer } = timedSignal(INTERNET_PROBE_TIMEOUT_MS);
  try {
    await fetch("https://www.gstatic.com/generate_204", { signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function classify(): Promise<Exclude<ConnectivityStatus, "checking">> {
  // Probes run concurrently (parallel wins over sequential for the blocked
  // state's latency); the internet result only matters when the backend fails.
  const [backend, internet] = await Promise.all([
    isBackendReachable(),
    isInternetReachable(),
  ]);
  if (backend) return "online";
  return internet ? "server-down" : "no-internet";
}

export function ConnectivityProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConnectivityStatus>("checking");
  const [checking, setChecking] = useState(false);
  // Single-flight guard shared by the polling effect and Retry(): a probe that
  // arrives mid-flight is dropped, and a stale probe can never overwrite the
  // result of a fresher one. The next tick/click picks it back up.
  const probingRef = useRef(false);

  // Owns the initial probe (status starts at "checking") plus all subsequent
  // polls (interval + AppState "active" wakeups). Online still probes at a
  // slower cadence so a drop is caught while the driver is online; blocked
  // states poll faster to recover quickly. Status writes only ever happen
  // after `await`, never synchronously in the effect body.
  useEffect(() => {
    // Guards against setting state after this effect has been torn down, which
    // otherwise races the flip from blocked to online.
    let cancelled = false;

    const probe = async () => {
      if (probingRef.current || cancelled) return;
      probingRef.current = true;
      try {
        const next = await classify();
        if (!cancelled) setStatus(next);
      } finally {
        probingRef.current = false;
      }
    };

    const intervalMs =
      status === "online" ? ONLINE_PROBE_INTERVAL_MS : RETRY_INTERVAL_MS;
    const id = setInterval(probe, intervalMs);
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") probe();
    });

    // Deferred first run so the "checking" splash isn't erased by a state
    // write from inside the effect body.
    const first = setTimeout(() => void probe(), 0);

    return () => {
      cancelled = true;
      clearTimeout(first);
      clearInterval(id);
      sub.remove();
    };
  }, [status]);

  // Manual Retry (button spinner): synchronous checking-state is fine here —
  // this is an event handler, not an effect.
  const retry = useCallback(async () => {
    if (probingRef.current) return;
    probingRef.current = true;
    setChecking(true);
    try {
      setStatus(await classify());
    } finally {
      probingRef.current = false;
      setChecking(false);
    }
  }, []);

  const value = useMemo(
    () => ({ status, checking, retry }),
    [status, checking, retry],
  );

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  );
}