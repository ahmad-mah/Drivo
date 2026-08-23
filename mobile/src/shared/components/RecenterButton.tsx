import { Pressable, View } from "react-native";
import { AppImage } from "./AppImage";

interface RecenterButtonProps {
  onPress: () => void;
}

/** The round green "center on me" map control, reused by all live maps. */
export function RecenterButton({ onPress }: RecenterButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className="rounded-full bg-green-500 p-3"
      style={{
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        shadowOpacity: 0.2,
        elevation: 3,
      }}
    >
      <AppImage
        source={require("@/assets/icons/target.png")}
        className="size-6"
        tintColor="#FFFFFF"
      />
    </Pressable>
  );
}
