import { Animated, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton, AppImage } from "@/shared/components";
import { useRideSearching } from "../hooks/useRideSearching";

interface RideSearchingCardProps {
  onRequestCancel: () => void;
  cancelling?: boolean;
}

export function RideSearchingCard({
  onRequestCancel,
  cancelling = false,
}: RideSearchingCardProps) {
  const insets = useSafeAreaInsets();
  const { pulse, fade, message } = useRideSearching();

  return (
    <View
      className="rounded-t-4xl bg-white px-5 pt-8"
      style={{
        paddingBottom: insets.bottom + 24,
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 12,
        shadowOpacity: 0.08,
        elevation: 8,
      }}
    >
      <View className="items-center gap-6">
        <View className="relative items-center justify-center">
          <Animated.View
            className="absolute size-24 rounded-full bg-primary-100"
            style={{ transform: [{ scale: pulse }] }}
          />
          <View className="z-10 size-16 items-center justify-center rounded-full bg-primary-500">
            <AppImage
              source={require("@/assets/icons/search.png")}
              className="size-7"
              tintColor="#FFFFFF"
            />
          </View>
        </View>

        <View className="items-center gap-2">
          <Text className="font-Jakarta-Bold text-xl text-secondary-900">
            Finding your ride
          </Text>
          <Animated.View style={{ opacity: fade }}>
            <Text className="text-center font-Jakarta text-sm text-secondary-500">
              {message}
            </Text>
          </Animated.View>
        </View>
      </View>

      <View className="mt-8">
        <AppButton
          title="Cancel ride"
          variant="danger"
          onPress={onRequestCancel}
          loading={cancelling}
        />
      </View>
    </View>
  );
}
