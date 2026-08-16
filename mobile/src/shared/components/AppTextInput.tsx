import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { KeyboardTypeOptions, ReturnKeyTypeOptions } from "react-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { AppImage } from "./AppImage";

export type AppTextInputProps = {
  placeholder: string;
  title?: string;
  icon?: any;
  iconEnd?: ReactNode;
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
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  textAlign?: "left" | "center" | "right";
  maxLength?: number;
};

const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  (
    {
      placeholder,
      title,
      icon,
      iconEnd,
      secureTextEntry,
      returnKeyType = "done",
      keyboardType = "default",
      inputMode,
      autoCapitalize,
      onSubmitEditing,
      value,
      onChangeText,
      onBlur,
      textAlign,
      maxLength,
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef<TextInput>(null);

    useImperativeHandle(ref, () => inputRef.current!);

    const isPassword = secureTextEntry;

    return (
      <View className="w-full gap-2">
        {title && <Text className="text-lg">{title}</Text>}
        <Pressable
          className={`py-0.5 px-4 gap-3 border rounded-3xl flex-row items-center bg-gray-100 ${
            isFocused ? "border-blue-500" : "border-transparent"
          }`}
          onPress={() => {
            inputRef.current?.focus();
            setIsFocused(true);
          }}
          onBlur={() => setIsFocused(false)}
        >
          {icon && (
            <AppImage className="size-6" source={icon} tintColor={"#858585"} />
          )}
          <TextInput
            className="font-Jakarta-Medium text-lg flex-1 text-gray-950"
            ref={inputRef}
            placeholder={placeholder}
            placeholderTextColor={"#ADADAD"}
            textAlign={textAlign}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            onFocus={() => setIsFocused(true)}
            secureTextEntry={isPassword && !showPassword}
            keyboardType={keyboardType}
            inputMode={inputMode}
            returnKeyType={returnKeyType}
            autoCapitalize={autoCapitalize}
            onSubmitEditing={onSubmitEditing}
            cursorColor={"#0286ff"}
            submitBehavior="submit"
            maxLength={maxLength}
          />
          {iconEnd && !isPassword && iconEnd}
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
      </View>
    );
  },
);

AppTextInput.displayName = "AppTextInput";

export { AppTextInput };
