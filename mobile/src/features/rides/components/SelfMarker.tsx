import { useCallback, useRef, useState } from "react";
import type { LocationObject } from "expo-location";
import { View } from "react-native";
import { Marker } from "react-native-maps";
import { AvatarCircle } from "./AvatarCircle";

interface SelfMarkerProps {
  location: LocationObject;
  isSelfSelected: boolean;
  userImageUrl?: string | null;
  userName?: string | null;
  onPress: () => void;
}

export function SelfMarker({
  location,
  isSelfSelected,
  userImageUrl,
  userName,
  onPress,
}: SelfMarkerProps) {
  const coordinate = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };

  const markerRef = useRef<React.ElementRef<typeof Marker>>(null);
  // Only the selected branch renders an async image; with no image to decode,
  // the snapshot is static and can be frozen immediately.
  const [tracking, setTracking] = useState(!!userImageUrl);

  const handleImageLoad = useCallback(() => {
    markerRef.current?.redraw();
    setTracking(false);
  }, []);

  if (isSelfSelected) {
    return (
      <Marker
        ref={markerRef}
        key="selected-self-marker"
        coordinate={coordinate}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={101}
        tracksViewChanges={tracking}
        onPress={(e) => {
          e?.stopPropagation?.();
          onPress();
        }}
      >
        <AvatarCircle
          imageUrl={userImageUrl}
          fallbackLabel={userName ? userName.charAt(0).toUpperCase() : "ME"}
          size={40}
          borderColor="#0286FF"
          borderWidth={1}
          onImageLoad={handleImageLoad}
        />
      </Marker>
    );
  }

  return (
    <Marker
      key="unselected-self-marker"
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={100}
      tracksViewChanges={false}
      onPress={(e) => {
        e?.stopPropagation?.();
        onPress();
      }}
    >
      <View className="rounded-full bg-blue-500 size-4.5 border border-white" />
    </Marker>
  );
}
