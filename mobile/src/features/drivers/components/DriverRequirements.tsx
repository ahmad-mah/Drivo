import { Text, View } from "react-native";

const requirements = [
  "A valid driver's license",
  "An eligible vehicle (type, model, color, plate)",
  "Your registered phone number on file",
];

export function DriverRequirements() {
  return (
    <View className="rounded-2xl border border-primary-200 bg-primary-100 p-5">
      <Text className="text-base font-Jakarta-Bold text-secondary-900">
        Driver Requirements
      </Text>
      <View className="mt-3 gap-2">
        {requirements.map((requirement) => (
          <View key={requirement} className="flex-row items-end gap-2">
            <View className="w-4 items-center justify-center">
              <Text className="text-sm leading-none text-primary-500 font-Jakarta-Bold">
                •
              </Text>
            </View>
            <Text className="flex-1 leading-none text-sm text-secondary-700 font-Jakarta-Regular">
              {requirement}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
