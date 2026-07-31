import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Controller } from "react-hook-form";
import type { KeyboardTypeOptions, ReturnKeyTypeOptions } from "react-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { AppImage } from "./AppImage";

type AppTextInputProps = {
  control?: any;
  name: string;
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
  textAlign?: "left" | "center" | "right";
  maxLength?: number;
};

const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  (
    {
      control,
      name,
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
      value: directValue,
      onChangeText: directOnChangeText,
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

    const renderInput = (
      fieldValue?: string,
      fieldOnChange?: (text: string) => void,
      fieldOnBlur?: () => void,
    ) => (
      <Pressable
        className={`py-0.5 px-4 gap-3 border rounded-3xl flex-row items-center bg-gray-200 ${
          isFocused ? "border-blue-500" : "border-gray-200"
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
          value={fieldValue}
          onChangeText={fieldOnChange}
          onBlur={fieldOnBlur}
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
    );

    return (
      <View className="w-full gap-2">
        {title && <Text className="text-lg">{title}</Text>}
        {control ? (
          <Controller
            name={name}
            control={control}
            render={({ field }) =>
              renderInput(field.value, field.onChange, field.onBlur)
            }
          />
        ) : (
          renderInput(directValue, directOnChangeText)
        )}
      </View>
    );
  },
);

AppTextInput.displayName = "AppTextInput";

export { AppTextInput };
