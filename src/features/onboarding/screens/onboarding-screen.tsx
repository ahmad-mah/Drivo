import { AppGap, AppSafeArea } from "@/shared/components";
import { Text, TouchableOpacity } from "react-native";
import {Image} from "expo-image";

export default function OnboardingScreen() {
  return (
    <AppSafeArea className="w-full h-full px-5">
      <AppGap height={24} />
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {}}
        className="self-end"
      >
        <Text className="font-Jakarta-Bold text-lg">Skip</Text>
      </TouchableOpacity>
      <AppGap height={40} />
      {/* <Image source={require('@/assets/images/')}/> */}
    </AppSafeArea>
  );
}
