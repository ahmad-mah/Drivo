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
  const [tracking, setTracking] = useState(!!userImageUrl);

  const handleImageLoad = useCallback(() => {
    markerRef.current?.redraw();
    setTracking(false);
  }, []);

  return (
    <Marker
      ref={markerRef}
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={isSelfSelected ? 101 : 100}
      tracksViewChanges={isSelfSelected ? tracking : false}
      onPress={(e) => {
        e?.stopPropagation?.();
        onPress();
      }}
    >
      {isSelfSelected ? (
        <AvatarCircle
          imageUrl={userImageUrl}
          fallbackLabel={userName ? userName.charAt(0).toUpperCase() : "ME"}
          size={40}
          borderColor="#0286FF"
          borderWidth={1}
          onImageLoad={handleImageLoad}
        />
      ) : (
        <View className="rounded-full bg-blue-500 size-4.5 border border-white" />
      )}
    </Marker>
  );
}
