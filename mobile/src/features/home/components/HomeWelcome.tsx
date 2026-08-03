import { Text, View } from "react-native";
import { AppIconButton } from "@/shared/components";

type HomeWelcomeProps = {
  userName?: string;
  onSignOut?: () => void;
};

export function HomeWelcome({ userName, onSignOut }: HomeWelcomeProps) {
  return (
    <View className="flex-row items-center justify-between rounded-2xl">
      <Text className="font-Jakarta-Bold text-secondary-900 text-2xl">
        Welcome {userName ?? ""}
      </Text>
      <AppIconButton
        icon={require("@/assets/icons/out.png")}
        onPress={onSignOut}
      />
    </View>
  );
}
