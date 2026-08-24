import { useEffect, useState } from "react";

// Visible loading duration on the Find button once drivers are ready, and the
// fallback so an empty search never leaves the spinner spinning forever.
const FIND_NOW_SEARCH_MS = 1200;
const FIND_NOW_MAX_MS = 3000;

/**
 * Find-now button choreography: keeps the spinner visible for a minimum
 * duration once a search starts, then hands over to the drivers sheet —
 * sooner when cars are already on the map, with a hard cap so an empty
 * result never hangs the spinner forever.
 */
export function useFindNowFeedback(
  driversCount: number,
  onSearchComplete: () => void,
) {
  const [findNowLoading, setFindNowLoading] = useState(false);

  useEffect(() => {
    if (!findNowLoading) return;
    const waitMs =
      driversCount === 0 ? FIND_NOW_MAX_MS : FIND_NOW_SEARCH_MS;
    const timer = setTimeout(() => {
      setFindNowLoading(false);
      onSearchComplete();
    }, waitMs);
    return () => clearTimeout(timer);
  }, [findNowLoading, driversCount, onSearchComplete]);

  const startFindNow = () => setFindNowLoading(true);

  return { findNowLoading, startFindNow };
}
