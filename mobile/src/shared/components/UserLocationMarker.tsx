import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Circle, Marker } from "react-native-maps";

interface UserLocationMarkerProps {
  latitude: number;
  longitude: number;
  /**
   * Whether tapping the dot toggles the coverage circle. Read-only maps
   * (e.g. the home map) pass false so the dot is inert.
   */
  interactive?: boolean;
  onPress?: () => void;
}

/** Coverage halo shown while the dot is tapped (nearby-search radius). */
const ACCURACY_RADIUS_M = 500;

/**
 * Custom rider indicator: a blue dot ringed in white. Tapping the dot toggles
 * a 500 m coverage circle so the rider can see how far nearby drivers are
 * matched from. Parent onPress still fires on every tap.
 *
 * The marker starts with tracksViewChanges=true and freezes only after the
 * child view has laid out — freezing from birth can snapshot an empty frame
 * when Android rebuilds the map surface after navigation, leaving an
 * invisible dot (same warm-up pattern CarMarker uses).
 */
export function UserLocationMarker({
  latitude,
  longitude,
  interactive = true,
  onPress,
}: UserLocationMarkerProps) {
  const [showCoverage, setShowCoverage] = useState(false);
  const [tracking, setTracking] = useState(true);
  const markerRef = useRef<React.ElementRef<typeof Marker>>(null);

  useEffect(() => {
    markerRef.current?.redraw();
  }, []);

  return (
    <>
      {showCoverage && (
        <Circle
          center={{ latitude, longitude }}
          radius={ACCURACY_RADIUS_M}
          strokeWidth={1}
          strokeColor="rgba(59,130,246,0.35)"
          fillColor="rgba(59,130,246,0.10)"
        />
      )}
      <Marker
        ref={markerRef}
        coordinate={{ latitude, longitude }}
        anchor={{ x: 0.5, y: 0.5 }}
        tracksViewChanges={tracking}
        zIndex={100}
        onPress={
          interactive
            ? onPress
              ? (e) => {
                  e?.stopPropagation?.();
                  setShowCoverage((v) => !v);
                  onPress();
                }
              : () => setShowCoverage((v) => !v)
            : undefined
        }
      >
        <View
          className="size-5 rounded-full border-[3px] border-white bg-blue-500"
          onLayout={() => setTracking(false)}
        />
      </Marker>
    </>
  );
}
