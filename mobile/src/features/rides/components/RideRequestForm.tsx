import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton, AppGap, AppImage, AppTextInput } from "@/shared/components";

interface RideRequestFormProps {
  from: string;
  to: string;
  onChangeFrom: (text: string) => void;
  onChangeTo: (text: string) => void;
  onUseCurrentLocation: () => void;
  onFindNow: () => void;
}

/** Bottom sheet for the ride request flow: from/to addresses and Find now. */
export function RideRequestForm({
  from,
  to,
  onChangeFrom,
  onChangeTo,
  onUseCurrentLocation,
  onFindNow,
}: RideRequestFormProps) {
  const insets = useSafeAreaInsets();

  return (
<View
      className="gap-3 rounded-t-4xl bg-white px-5 pt-5"
      style={{
        paddingBottom: insets.bottom + 20,
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: -4 },
        shadowRadius: 16,
        shadowOpacity: 0.15,
        elevation: 8,
      }}
    >
      <AppTextInput
        title="From"
        placeholder="From location"
        value={from}
        onChangeText={onChangeFrom}
        icon={require("@/assets/icons/point.png")}
        iconEnd={
          <Pressable onPress={onUseCurrentLocation} hitSlop={8}>
            <AppImage
              source={require("@/assets/icons/target.png")}
              className="size-6"
            />
          </Pressable>
        }
      />
      <AppTextInput
        title="To"
        placeholder="To location"
        value={to}
        onChangeText={onChangeTo}
        icon={require("@/assets/icons/point.png")}
        iconEnd={
          <AppImage
            source={require("@/assets/icons/map.png")}
            className="size-6"
          />
        }
      />
      <AppGap height={8} />
      <AppButton title="Find now" onPress={onFindNow} />
    </View>
  );
}
