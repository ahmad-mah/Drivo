import { Pressable, Text, View } from "react-native";
import { AppImage } from "@/shared/components";
import { goToDriverMode } from "@/shared/services/navigation";

/** Home-screen entry point for approved drivers — replaces the status card
 *  and takes over the app with a full-screen driver map. */
export function GoDriveCard() {
  return (
    <Pressable
      onPress={goToDriverMode}
      className="w-full flex-row items-center gap-4 rounded-2xl bg-primary-500 p-5"
    >
      <View className="rounded-full bg-white/20 p-3">
        <Text className="text-2xl">🚗</Text>
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-lg font-Jakarta-Bold text-white">Go Drive</Text>
        <Text className="text-sm font-Jakarta-Regular text-white/80">
          Start receiving ride requests in your area
        </Text>
      </View>
      <AppImage
        source={require("@/assets/icons/back-arrow.png")}
        className="size-5 rotate-180"
        tintColor="#ffffff"
      />
    </Pressable>
  );
}
