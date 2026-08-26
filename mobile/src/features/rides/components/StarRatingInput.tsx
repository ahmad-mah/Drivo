import { Pressable, Text, View } from "react-native";
import { AppImage } from "@/shared/components";

interface StarRatingInputProps {
  value: number | null;
  onChange: (stars: number) => void;
  disabled?: boolean;
  size?: "sm" | "lg";
}

/**
 * Tappable 1–5 star input for post-trip ratings. Stars fill up to the
 * selected value; tapping the current value again keeps it (no un-rate —
 * submissions are final on the backend).
 */
export function StarRatingInput({
  value,
  onChange,
  disabled = false,
  size = "lg",
}: StarRatingInputProps) {
  return (
    <View className="flex-row items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = (value ?? 0) >= star;
        return (
          <Pressable
            key={star}
            onPress={() => !disabled && onChange(star)}
            disabled={disabled}
            hitSlop={6}
          >
            <AppImage
              source={require("@/assets/icons/star.png")}
              className={size === "lg" ? "size-10" : "size-8"}
              tintColor={filled ? "#FACC15" : "#E5E5E5"}
            />
          </Pressable>
        );
      })}
      {value != null && (
        <Text className="ml-1 font-Jakarta-Bold text-sm text-secondary-700">
          {value}.0
        </Text>
      )}
    </View>
  );
}
