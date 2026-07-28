import { useRef } from "react";
import { Pressable, TextInput, View } from "react-native";
import { AppImage } from "@/shared/components";

export function HomeSearch() {
  const ref = useRef<TextInput>(null);

  return (
    <Pressable
      className="flex-row items-center gap-3 rounded-full bg-white py-1 px-5"
      onPress={() => ref.current?.focus()}
    >
      <View pointerEvents="none">
        <AppImage
          className="size-7"
          source={require("@/assets/icons/search.png")}
        />
      </View>
      <TextInput
        ref={ref}
        className="font-Jakarta flex-1 text-base text-secondary-900"
        placeholder="Where do you want to go?"
        placeholderTextColor="#ADADAD"
        autoCapitalize="words"
        style={{ fontSize: 15 }}
      />
    </Pressable>
  );
}
