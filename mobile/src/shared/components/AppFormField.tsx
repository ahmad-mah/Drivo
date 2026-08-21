import type { ReactElement, Ref } from "react";
import { Text, View, type TextInput } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { AppTextInput, type AppTextInputProps } from "./AppTextInput";

type AppFormFieldProps = Omit<
  AppTextInputProps,
  "value" | "onChangeText" | "onBlur" | "placeholder"
> & {
  name: string;
  placeholder?: string;
  inputRef?: Ref<TextInput>;
  children?: (field: {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
  }) => ReactElement;
};

export function AppFormField({ name, inputRef, children, ...inputProps }: AppFormFieldProps) {
  const { control } = useFormContext();

  return (
    <View className="w-full">
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => {
          const message = fieldState.error?.message;
          return (
            <>
              {children ? (
                children({ value: field.value, onChange: field.onChange, onBlur: field.onBlur })
              ) : (
                <AppTextInput
                  ref={inputRef}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={inputProps.placeholder ?? ""}
                  {...inputProps}
                />
              )}
              {message ? <Text className="text-red-500 text-sm mt-1 ms-2">{message}</Text> : null}
            </>
          );
        }}
      />
    </View>
  );
}