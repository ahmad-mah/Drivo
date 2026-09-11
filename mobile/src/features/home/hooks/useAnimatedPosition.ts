import { useEffect, useRef, useState } from "react";

const ANIMATION_DURATION_MS = 800;
const JITTER_THRESHOLD_DEG = 0.000005;

/** Smooth ease-out curve (fast start, gentle landing). */
function easeOut(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Interpolates latitude/longitude from their previous values to new targets
 * over 800 ms using requestAnimationFrame. Micro-moves below ~0.5 m are
 * snapped instantly to avoid GPS jitter animation.
 */
export function useAnimatedPosition(
  targetLat: number,
  targetLon: number,
): { latitude: number; longitude: number } {
  const [pos, setPos] = useState({ latitude: targetLat, longitude: targetLon });

  const fromRef = useRef({ latitude: targetLat, longitude: targetLon });
  const toRef = useRef({ latitude: targetLat, longitude: targetLon });
  const currentRef = useRef({ latitude: targetLat, longitude: targetLon });
  const startRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const prev = currentRef.current;
    const dLat = Math.abs(targetLat - prev.latitude);
    const dLon = Math.abs(targetLon - prev.longitude);

    if (dLat < JITTER_THRESHOLD_DEG && dLon < JITTER_THRESHOLD_DEG) {
      setPos({ latitude: targetLat, longitude: targetLon });
      currentRef.current = { latitude: targetLat, longitude: targetLon };
      fromRef.current = { latitude: targetLat, longitude: targetLon };
      toRef.current = { latitude: targetLat, longitude: targetLon };
      return;
    }

    fromRef.current = { ...currentRef.current };
    toRef.current = { latitude: targetLat, longitude: targetLon };
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      const eased = easeOut(t);

      const lat = fromRef.current.latitude + (toRef.current.latitude - fromRef.current.latitude) * eased;
      const lon = fromRef.current.longitude + (toRef.current.longitude - fromRef.current.longitude) * eased;

      currentRef.current = { latitude: lat, longitude: lon };
      setPos({ latitude: lat, longitude: lon });

      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        currentRef.current = { latitude: targetLat, longitude: targetLon };
        fromRef.current = { latitude: targetLat, longitude: targetLon };
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafRef.current);
  }, [targetLat, targetLon]);

  return pos;
}
