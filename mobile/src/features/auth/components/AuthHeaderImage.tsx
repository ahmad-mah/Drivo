import { View, Text } from "react-native";
import { AppImage } from "@/shared/components";
import { LinearGradient } from "expo-linear-gradient";

type AuthHeaderImageProps = {
  title: string;
};

export default function AuthHeaderImage({ title }: AuthHeaderImageProps) {
  return (
    <View className="relative w-full">
      <AppImage
        source={require("@/assets/images/signup-car.png")}
        className="w-full h-72 object-fill"
      />
      <LinearGradient
        colors={["transparent", "white"]}
        className="absolute bottom-0 left-0 right-0 h-2/8"
      />
      <Text className="absolute bottom-9 inset-s-6 font-Jakarta-Bold text-secondary-900 text-3xl">
        {title}
      </Text>
    </View>
  );
}
