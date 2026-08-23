import { useRef } from "react";
import type { TextInput } from "react-native";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton, AppGap, AppImage } from "@/shared/components";
import { PlaceField } from "./PlaceField";
import type { PickField, PlaceSuggestion } from "../types/ride.types";

export type { PickField };

interface RideRequestFormProps {
  from: string;
  to: string;
  onChangeFrom: (text: string) => void;
  onChangeTo: (text: string) => void;
  onUseCurrentLocation: () => void;
  fromSuggestions: PlaceSuggestion[];
  fromSuggestionsLoading: boolean;
  onSelectFromSuggestion: (suggestion: PlaceSuggestion) => void;
  suggestions: PlaceSuggestion[];
  suggestionsLoading: boolean;
  onSelectSuggestion: (suggestion: PlaceSuggestion) => void;
  onFindNow: () => void;
  findNowLoading: boolean;
  pickingField: PickField | null;
  onRequestPickMap: (field: PickField) => void;
}

function PickOnMapButton({
  active,
  onPress,
}: {
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <AppImage
        source={require("@/assets/icons/map.png")}
        className="size-6"
        tintColor={active ? "#0286FF" : "#858585"}
      />
    </Pressable>
  );
}

/** Bottom sheet for the ride request flow: from/to addresses and Find now. */
export function RideRequestForm({
  from,
  to,
  onChangeFrom,
  onChangeTo,
  onUseCurrentLocation,
  fromSuggestions,
  fromSuggestionsLoading,
  onSelectFromSuggestion,
  suggestions,
  suggestionsLoading,
  onSelectSuggestion,
  onFindNow,
  findNowLoading,
  pickingField,
  onRequestPickMap,
}: RideRequestFormProps) {
  const insets = useSafeAreaInsets();
  const toFieldRef = useRef<TextInput>(null);

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
      {/* Handle Bar */}
      <View className="items-center pb-1">
        <View className="h-1.5 w-12 rounded-full bg-general-300" />
      </View>
      <PlaceField
        title="From"
        placeholder="From location"
        value={from}
        onChangeText={onChangeFrom}
        icon={require("@/assets/icons/point.png")}
        suggestions={fromSuggestions}
        suggestionsLoading={fromSuggestionsLoading}
        onSelect={onSelectFromSuggestion}
        returnKeyType="next"
        onSubmitEditing={() => toFieldRef.current?.focus()}
        iconEnd={
          <View className="flex-row items-center gap-3">
            <PickOnMapButton
              active={pickingField === "from"}
              onPress={() => onRequestPickMap("from")}
            />
            <Pressable onPress={onUseCurrentLocation} hitSlop={8}>
              <AppImage
                source={require("@/assets/icons/target.png")}
                className="size-6"
              />
            </Pressable>
          </View>
        }
      />
      <PlaceField
        ref={toFieldRef}
        title="To"
        placeholder="To location"
        value={to}
        onChangeText={onChangeTo}
        icon={require("@/assets/icons/point.png")}
        suggestions={suggestions}
        suggestionsLoading={suggestionsLoading}
        onSelect={onSelectSuggestion}
        // Done closes the keyboard — the default "submit" would keep it open.
        submitBehavior="blurAndSubmit"
        iconEnd={
          <PickOnMapButton
            active={pickingField === "to"}
            onPress={() => onRequestPickMap("to")}
          />
        }
      />
      <AppGap height={8} />
      {/* Hidden while picking so the sheet shrinks and exposes more map. */}
      {!pickingField && (
        <AppButton
          title="Find now"
          onPress={onFindNow}
          loading={findNowLoading}
        />
      )}
    </View>
  );
}
