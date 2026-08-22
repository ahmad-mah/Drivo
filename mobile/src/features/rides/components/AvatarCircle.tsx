import { Text, View } from "react-native";
import { AppImage } from "@/shared/components";

interface AvatarCircleProps {
  imageUrl?: string | null;
  fallbackLabel: string;
  size: number;
  borderColor: string;
  borderWidth?: number;
  fallbackClassName?: string;
  fallbackTextClassName?: string;
  onImageLoad?: () => void;
}

export function AvatarCircle({
  imageUrl,
  fallbackLabel,
  size,
  borderColor,
  borderWidth = 3,
  fallbackClassName = "bg-blue-100",
  fallbackTextClassName = "text-blue-600",
  onImageLoad,
}: AvatarCircleProps) {
  return (
    <View
      className="overflow-hidden rounded-full bg-white shadow-sm"
      style={{ width: size, height: size, borderWidth, borderColor }}
    >
      {imageUrl ? (
        <AppImage
          source={{ uri: imageUrl }}
          className="size-full"
          transition={0}
          onLoad={onImageLoad}
        />
      ) : (
        <View className={`size-full items-center justify-center ${fallbackClassName}`}>
          <Text className={`font-Jakarta-Bold text-lg ${fallbackTextClassName}`}>
            {fallbackLabel}
          </Text>
        </View>
      )}
    </View>
  );
}