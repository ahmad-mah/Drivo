import { useCallback, useRef } from "react";

/**
 * Prevents rapid double-taps: fires immediately on the first press, then
 * ignores further presses until the lockout window elapses.
 */
export function usePressLock(delayMs = 500) {
  const lastPressAt = useRef(0);

  return useCallback(
    (action: () => void) => {
      const now = Date.now();
      if (now - lastPressAt.current < delayMs) return;
      lastPressAt.current = now;
      action();
    },
    [delayMs],
  );
}
