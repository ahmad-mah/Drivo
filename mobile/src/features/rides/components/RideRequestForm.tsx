import { useRef } from "react";
import type { TextInput } from "react-native";
import { Pressable, View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppButton, AppImage } from "@/shared/components";
import { PlaceField } from "./PlaceField";
import type { PickField, PlaceSuggestion } from "../types/ride.types";

export type { PickField };

export interface RideRequestFormProps {
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
      className="rounded-t-4xl bg-white px-5 pt-3"
      style={{
        paddingBottom: insets.bottom + 20,
        shadowColor: "#101010",
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 12,
        shadowOpacity: 0.08,
        elevation: 8,
      }}
    >
      {/* Handle Bar */}
      <View className="items-center pb-2">
        <View className="h-1 w-10 rounded-full bg-general-300" />
      </View>

      {/* Title */}
      <Text className="mb-4 font-Jakarta-Bold text-xl text-secondary-900">
        Where to?
      </Text>

      <View className="gap-3">
        <PlaceField
          title="From"
          placeholder="Current location"
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
          placeholder="Where are you going?"
          value={to}
          onChangeText={onChangeTo}
          icon={require("@/assets/icons/point.png")}
          suggestions={suggestions}
          suggestionsLoading={suggestionsLoading}
          onSelect={onSelectSuggestion}
          submitBehavior="blurAndSubmit"
          iconEnd={
            <PickOnMapButton
              active={pickingField === "to"}
              onPress={() => onRequestPickMap("to")}
            />
          }
        />
      </View>

      {/* CTA — hidden while picking so the sheet shrinks and exposes more map */}
      <View className="mt-5">
        {!pickingField && (
          <AppButton
            title="Find drivers"
            onPress={onFindNow}
            loading={findNowLoading}
          />
        )}
      </View>
    </View>
  );
}
