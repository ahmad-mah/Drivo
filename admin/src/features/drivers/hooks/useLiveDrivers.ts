import { useEffect, useState } from "react";
import * as driversApi from "../api/admin-drivers.api";
import { connectLiveMap, disconnectLiveMap } from "../services/live-socket";
import type { LiveDriver } from "../types/driver";

/**
 * Owns the live-drivers data: REST paint first, then the socket `drivers:
 * locations` snapshots replace it. The socket is the source of truth once
 * connected — snapshots are complete, not deltas.
 */
export function useLiveDrivers() {
  const [drivers, setDrivers] = useState<LiveDriver[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const initial = await driversApi.listLiveDrivers();
        if (cancelled) return;
        setDrivers(initial);
      } catch {
        // Socket snapshots will fill the map if the REST paint fails.
      }

      if (cancelled) return;
      await connectLiveMap((snapshot) => {
        if (cancelled) return;
        setDrivers(snapshot);
        setConnected(true);
      });
    };

    init();

    return () => {
      cancelled = true;
      disconnectLiveMap();
    };
  }, []);

  return { drivers, connected };
}