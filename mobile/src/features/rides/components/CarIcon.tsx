import { View } from "react-native";
import { AppImage } from "@/shared/components";

interface CarIconProps {
  heading?: number | null;
  onLoad?: () => void;
}

/** The black car marker icon, rotated to the driver's heading. */
export function CarIcon({ heading, onLoad }: CarIconProps) {
  return (
    <View style={{ transform: [{ rotate: `${heading ?? 0}deg` }] }}>
      <AppImage
        source={require("@/assets/icons/marker.png")}
        className="size-12"
        tintColor="#000000"
        transition={0}
        recyclingKey="car-marker"
        placeholder="#eeeeee"
        onLoad={onLoad}
      />
    </View>
  );
}