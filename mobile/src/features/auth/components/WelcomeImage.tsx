import { AppImage } from "@/shared/components";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

export function WelcomeImage() {
  return (
    <View className="w-full flex-1 relative">
      <AppImage
        source={require("@/assets/images/get-started.png")}
        className="w-full flex-1 object-cover"
      />
      <LinearGradient
        colors={["transparent", "white"]}
        className="absolute bottom-0 left-0 right-0 h-2/8"
      />
    </View>
  );
}
