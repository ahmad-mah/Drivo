import { Pressable, Text, View } from "react-native";
import { AppImage } from "@/shared/components";

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
      <Pressable className="rounded-full bg-white p-2.5" onPress={onSignOut}>
        <AppImage
          className="size-6"
          source={require("@/assets/icons/out.png")}
        />
      </Pressable>
    </View>
  );
}
