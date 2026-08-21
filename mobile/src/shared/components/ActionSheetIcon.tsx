import { MaterialCommunityIcons } from "@expo/vector-icons";

export function ActionSheetIcon({
  name,
  size = 24,
  color = "#666",
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
}