import { forwardRef, type ReactNode } from "react";
import type { TextInput } from "react-native";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import type { ReturnKeyTypeOptions } from "react-native";
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
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  submitBehavior?: "submit" | "blurAndSubmit" | "newline";
}

/**
 * From/To address field with an inline Google Places suggestion list that
 * appears while typing. `iconEnd` is swapped for a spinner while searching.
 * Forwards its input ref so parents can chain focus (e.g. From → To).
 */
export const PlaceField = forwardRef<TextInput, PlaceFieldProps>(
  function PlaceField(
    {
      title,
      placeholder,
      value,
      onChangeText,
      suggestions,
      suggestionsLoading,
      onSelect,
      icon,
      iconEnd,
      returnKeyType = "done",
      onSubmitEditing,
      submitBehavior,
    },
    ref,
  ) {
    return (
      <View className="gap-1">
        <AppTextInput
          ref={ref}
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
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          submitBehavior={submitBehavior}
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
  },
);
