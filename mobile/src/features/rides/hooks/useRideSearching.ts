import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

const ESCALATION_THRESHOLD_MS = 40_000;

const MESSAGES = [
  "Waiting for a driver to respond",
  "Still looking for a driver…",
] as const;

/**
 * Manages the elapsed timer, message escalation index, and pulsing/fade
 * animations for the ride-searching card. Returns pure values for the
 * presentational component to consume.
 */
export function useRideSearching() {
  const [elapsed, setElapsed] = useState(0);
  const [fade] = useState(() => new Animated.Value(1));
  const [pulse] = useState(() => new Animated.Value(1));
  const prevIndex = useRef(0);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - start), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const messageIndex = elapsed >= ESCALATION_THRESHOLD_MS ? 1 : 0;

  useEffect(() => {
    if (messageIndex === prevIndex.current) return;
    Animated.sequence([
      Animated.timing(fade, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    prevIndex.current = messageIndex;
  }, [messageIndex, fade]);

  return {
    pulse,
    fade,
    message: MESSAGES[messageIndex],
  };
}
