import { memo, useMemo } from "react";
import type { NearbyDriver } from "@/features/rides/types/ride.types";
import { CarMarker } from "@/features/rides/components/CarMarker";
import { useAnimatedPosition } from "../hooks/useAnimatedPosition";

interface AnimatedCarMarkerProps {
  driver: NearbyDriver;
}

/**
 * CarMarker wrapper that smoothly interpolates position between socket
 * updates using useAnimatedPosition (800 ms ease-out).
 */
export const AnimatedCarMarker = memo(function AnimatedCarMarker({
  driver,
}: AnimatedCarMarkerProps) {
  const { latitude, longitude } = useAnimatedPosition(
    driver.latitude,
    driver.longitude,
  );

  const smoothDriver = useMemo(
    () => ({ ...driver, latitude, longitude }),
    [driver, latitude, longitude],
  );

  return <CarMarker driver={smoothDriver} />;
});
