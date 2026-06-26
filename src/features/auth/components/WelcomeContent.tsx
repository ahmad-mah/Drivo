import { Text, View } from "react-native";

export function WelcomeContent() {
  return (
    <View className="items-center gap-3 px-6">
      <Text className="font-Jakarta-Bold text-[28px]">
        Let&apos;s get started
      </Text>
      <Text className="font-Jakarta text-xl text-center text-secondary-600">
        Sign up or log in to find out the best car for you
      </Text>
    </View>
  );
}
