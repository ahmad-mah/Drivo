import { Pressable } from "react-native";
import { AppImage } from "./AppImage";

type AppIconButtonProps = {
  icon: number;
  onPress?: () => void;
  tintColor?: string;
  className?: string;
};

/** Circular white icon button, used for header back-arrows and sign-out. */
export function AppIconButton({
  icon,
  onPress,
  tintColor,
  className,
}: AppIconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full bg-white p-2.5 self-start ${className ?? ""}`}
    >
      <AppImage source={icon} className="size-6" tintColor={tintColor} />
    </Pressable>
  );
}
