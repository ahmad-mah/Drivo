import { Text, View } from "react-native";
import { AppImage } from "@/shared/components";

interface ParticipantCardProps {
  role: string;
  name: string;
  imageUrl: string | null;
  rating?: number | null;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ParticipantCard({
  role,
  name,
  imageUrl,
  rating,
}: ParticipantCardProps) {
  return (
    <View className="flex-row items-center gap-3.5 rounded-2xl border border-general-300 bg-white p-3.5">
      <View className="size-12 overflow-hidden rounded-full bg-primary-100">
        {imageUrl ? (
          <AppImage source={{ uri: imageUrl }} className="size-full" />
        ) : (
          <View className="size-full items-center justify-center">
            <Text className="font-Jakarta-Bold text-lg text-primary-500">
              {initialsOf(name)}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1 gap-0.5">
        <Text
          className="font-Jakarta-SemiBold text-base text-secondary-900"
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text className="font-Jakarta-Bold text-xs uppercase tracking-wider text-secondary-500">
          {role}
        </Text>
      </View>

      {rating != null && (
        <View className="flex-row items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5">
          <AppImage
            source={require("@/assets/icons/star.png")}
            className="size-3"
            tintColor="#FACC15"
          />
          <Text className="font-Jakarta-Bold text-xs text-primary-600">
            {rating.toFixed(1)}
          </Text>
        </View>
      )}
    </View>
  );
}
