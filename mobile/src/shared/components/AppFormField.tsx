"use no memo";
import type { ReactElement, Ref } from "react";
import { Text, View, type TextInput } from "react-native";
import { Controller, useFormContext, useFormState } from "react-hook-form";
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

// The only place formState is read outside AppForm. React Compiler must never
// memoize this component or error re-renders silently stop.
export function AppFormField({ name, inputRef, children, ...inputProps }: AppFormFieldProps) {
  const { control } = useFormContext();
  // useFormState subscribes directly to RHF's state subject so this field
  // re-renders on its own, independent of how the host screen is memoized.
  const { errors } = useFormState({ control });
  const message = (errors as Record<string, { message?: string }>)[name]?.message;

  return (
    <View className="w-full">
      <Controller
        name={name}
        control={control}
        render={({ field }) =>
          children ? (
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
          )
        }
      />
      {message ? <Text className="text-red-500 text-sm mt-1 ms-2">{message}</Text> : null}
    </View>
  );
}
