import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useCallback, type ReactNode } from "react";
import { usePressLock } from "@/shared/hooks/usePressLock";
import { cn } from "@/shared/utils/cn";

type AppButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "outline" | "danger";
  icon?: ReactNode;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
};

const variantStyles = {
  primary: {
    button: "bg-primary-500",
    text: "text-secondary-200",
    buttonDisabled: "bg-primary-300",
    indicator: "text-secondary-200",
  },
  outline: {
    button: "bg-white",
    text: "text-secondary-900",
    buttonDisabled: "bg-gray-200",
    indicator: "text-secondary-600",
  },
  danger: {
    button: "bg-danger-500",
    text: "text-white",
    buttonDisabled: "bg-danger-300",
    indicator: "text-white",
  },
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
  icon,
  className,
  loading = false,
  disabled = false,
}: AppButtonProps) {
  const styles = variantStyles[variant];
  const isDisabled = loading || disabled;
  const lock = usePressLock();

  const handlePress = useCallback(() => {
    lock(() => onPress?.());
  }, [lock, onPress]);

  return (
    <Pressable
      className={cn(
        "rounded-full w-full justify-center items-center py-4.5",
        isDisabled ? styles.buttonDisabled : styles.button,
        className,
      )}
      style={{
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        shadowOpacity: variant === "primary" ? 0.18 : 0.06,
        elevation: 2,
      }}
      onPress={handlePress}
      disabled={isDisabled}
    >
      <View className="flex-row items-center gap-3">
        {loading ? (
          <ActivityIndicator
            size="small"
            color={styles.indicator}
            className={styles.indicator}
          />
        ) : (
          icon
        )}
        <Text
          className={cn(
            "text-lg font-Jakarta-Bold",
            styles.text,
            loading && "opacity-70",
          )}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
