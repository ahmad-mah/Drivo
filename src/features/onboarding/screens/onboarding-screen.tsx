import AppSafeArea from "@/shared/components/AppSafeArea";
import { Text, TouchableOpacity } from "react-native";
import AppGap from "../../../shared/components/AppGap";

export default function OnboardingScreen() {
  return (
    <AppSafeArea className="flex-1 px-10">
      <AppGap height={24} />
      <TouchableOpacity>
        <Text>Skip</Text>
      </TouchableOpacity>
    </AppSafeArea>
  );
}
