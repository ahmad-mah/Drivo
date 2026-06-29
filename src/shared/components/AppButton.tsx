import { ActivityIndicator, Pressable, Text, View } from "react-native";
import type { ReactNode } from "react";

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type AppButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "outline";
  icon?: ReactNode;
  className?: string;
  loading?: boolean;
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
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
  icon,
  className,
  loading = false,
}: AppButtonProps) {
  const styles = variantStyles[variant];

  return (
    <Pressable
      className={cn(
        "rounded-full w-full justify-center items-center py-4.5",
        loading ? styles.buttonDisabled : styles.button,
        className,
      )}
      style={{
        shadowColor: "#101010",
        shadowOffset: { width: 4, height: 8 },
        shadowRadius: 24,
        shadowOpacity: 0.15,
        elevation: 1.4,
      }}
      onPress={onPress}
      disabled={loading}
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
