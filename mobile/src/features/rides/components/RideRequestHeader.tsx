import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIconButton } from "@/shared/components";

interface RideRequestHeaderProps {
  title?: string;
  onBack: () => void;
}

/** Top bar for the ride request screen: back button floating over the map. */
export function RideRequestHeader({
  title = "Ride",
  onBack,
}: RideRequestHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute inset-x-0 px-5 flex-row items-center gap-5 z-50"
      style={{ top: insets.top + 12 }}
    >
      <AppIconButton
        icon={require("@/assets/icons/back-arrow.png")}
        onPress={onBack}
        tintColor="#333333"
      />
      <Text className="font-Jakarta-Bold text-2xl text-secondary-900">
        {title}
      </Text>
    </View>
  );
}
