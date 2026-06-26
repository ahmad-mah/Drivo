import { Text, View } from "react-native";

export function OrDivider() {
  return (
    <View className="flex-row gap-3 items-center">
      <View className="bg-secondary-300 h-0.5 flex-1" />
      <Text className="text-lg font-Jakarta">Or</Text>
      <View className="bg-secondary-300 h-0.5 flex-1" />
    </View>
  );
}
