import { Text, TouchableOpacity } from "react-native";

export function TextActionRow({
  text,
  action,
  onAction,
}: {
  text: string;
  action: string;
  onAction?: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center"
      onPress={onAction}
      activeOpacity={onAction ? 0.8 : 1}
    >
      <Text className="font-Jakarta-Medium text-xl text-secondary-600">
        {text}{" "}
      </Text>
      <Text className="font-Jakarta-SemiBold text-lg text-primary-500">
        {action}
      </Text>
    </TouchableOpacity>
  );
}
