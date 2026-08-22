import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { AppImage, AppTextInput } from "@/shared/components";
import type { PlaceSuggestion } from "../types/ride.types";

interface PlaceFieldProps {
  title: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  suggestions: PlaceSuggestion[];
  suggestionsLoading: boolean;
  onSelect: (suggestion: PlaceSuggestion) => void;
  icon?: ReactNode;
  iconEnd?: ReactNode;
}

/**
 * From/To address field with an inline Google Places suggestion list that
 * appears while typing. `iconEnd` is swapped for a spinner while searching.
 */
export function PlaceField({
  title,
  placeholder,
  value,
  onChangeText,
  suggestions,
  suggestionsLoading,
  onSelect,
  icon,
  iconEnd,
}: PlaceFieldProps) {
  return (
    <View className="gap-1">
      <AppTextInput
        title={title}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        icon={icon}
        iconEnd={
          suggestionsLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            iconEnd
          )
        }
      />
      {suggestions.length > 0 && (
        <View
          className="gap-1 overflow-hidden rounded-2xl bg-white p-1"
          style={{
            shadowColor: "#101010",
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 12,
            shadowOpacity: 0.12,
            elevation: 4,
          }}
        >
          {suggestions.map((suggestion, index) => (
            <Pressable
              key={`${suggestion.address}-${suggestion.latitude}-${suggestion.longitude}-${index}`}
              className="flex-row items-center gap-3 px-3 py-2.5"
              onPress={() => onSelect(suggestion)}
            >
              <AppImage
                source={require("@/assets/icons/pin.png")}
                className="size-4"
              />
              <Text
                className="flex-1 font-Jakarta text-sm text-secondary-900"
                numberOfLines={1}
              >
                {suggestion.address}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}