import { Text, View } from "react-native";

interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
}

export function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <View className="flex-1 items-center gap-1.5 rounded-2xl bg-general-500 py-3.5">
      <Text className="font-Jakarta text-xs text-secondary-500">{label}</Text>
      <Text
        className={`font-Jakarta-Bold text-base ${
          highlight ? "text-primary-500" : "text-secondary-900"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
