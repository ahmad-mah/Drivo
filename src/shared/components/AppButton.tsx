import { Pressable, Text, View } from "react-native";
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
};

const variantStyles = {
  primary: {
    button: "bg-primary-500",
    text: "text-secondary-200",
  },
  outline: {
    button: "bg-white",
    text: "text-secondary-900",
  },
};

export function AppButton({
  title,
  onPress,
  variant = "primary",
  icon,
  className,
}: AppButtonProps) {
  const styles = variantStyles[variant];

  return (
    <Pressable
      className={cn(
        "rounded-full w-full justify-center items-center py-4.5",
        styles.button,
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
    >
      <View className="flex-row items-center gap-3">
        {icon}
        <Text className={cn("text-lg font-Jakarta-Bold", styles.text)}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
