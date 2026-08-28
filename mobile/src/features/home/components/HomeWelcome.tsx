import { Text, View } from "react-native";
import { AppIconButton } from "@/shared/components";

type HomeWelcomeProps = {
  userName?: string;
  onSignOut?: () => void;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeWelcome({ userName, onSignOut }: HomeWelcomeProps) {
  return (
    <View className="flex-row items-center justify-between py-1">
      <View className="flex-1 gap-1">
        <Text className="font-Jakarta text-sm text-secondary-500">
          {getGreeting()}
        </Text>
        <Text className="font-Jakarta-Bold text-2xl text-secondary-900">
          {userName ?? "Welcome"}
        </Text>
      </View>
      <AppIconButton
        icon={require("@/assets/icons/out.png")}
        onPress={onSignOut}
        tintColor="#858585"
      />
    </View>
  );
}
