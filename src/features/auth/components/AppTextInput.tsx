import { View, Text, TextInput, Pressable } from "react-native";
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Controller } from "react-hook-form";
import { AppImage } from "@/shared/components";
import type { KeyboardTypeOptions, ReturnKeyTypeOptions } from "react-native";

type AppTextInputProps = {
  control: any;
  name: string;
  placeholder: string;
  title: string;
  icon?: any;
  secureTextEntry?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  keyboardType?: KeyboardTypeOptions;
  inputMode?:
    | "text"
    | "none"
    | "email"
    | "tel"
    | "url"
    | "numeric"
    | "decimal"
    | "search";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  onSubmitEditing?: () => void;
};

const AppTextInput = forwardRef<TextInput, AppTextInputProps>(({
  control,
  name,
  placeholder,
  title,
  icon,
  secureTextEntry,
  returnKeyType = "done",
  keyboardType = "default",
  inputMode,
  autoCapitalize,
  onSubmitEditing,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => inputRef.current!);

  const isPassword = secureTextEntry;

  return (
    <View className="w-full gap-2">
      <Text className="text-lg">{title}</Text>
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <Pressable
              className={` py-.5 px-4 gap-3  border rounded-3xl flex-row items-center ${
                isFocused ? "border-blue-500" : "border-gray-300"
              }`}
              onPress={() => {
                inputRef.current?.focus();
                setIsFocused(true);
              }}
              onBlur={() => setIsFocused(false)}
            >
              {icon && (
                <AppImage
                  className="size-6"
                  source={icon}
                  tintColor={"#858585"}
                />
              )}
              <TextInput
                className="font-Jakarta-Medium text-lg flex-1"
                ref={inputRef}
                placeholder={placeholder}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                onFocus={() => setIsFocused(true)}
                secureTextEntry={isPassword && !showPassword}
                keyboardType={keyboardType}
                inputMode={inputMode}
                returnKeyType={returnKeyType}
                autoCapitalize={autoCapitalize}
                onSubmitEditing={onSubmitEditing}
                cursorColor={"#0286ff"}
                submitBehavior="submit"
              />
              {isPassword && (
                <Pressable
                  onPress={(e) => {
                    setShowPassword((prev) => !prev);
                  }}
                  hitSlop={8}
                >
                  <AppImage
                    className="size-6"
                    source={
                      showPassword
                        ? require("@/assets/icons/eye.png")
                        : require("@/assets/icons/eyecross.png")
                    }
                    tintColor={showPassword ? "#0286ff" : "#000000"}
                  />
                </Pressable>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
});

AppTextInput.displayName = "AppTextInput";

export default AppTextInput;
