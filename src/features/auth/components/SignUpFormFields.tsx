import { View, Text, TextInput, Keyboard } from "react-native";
import { useRef } from "react";
import AppTextInput from "./AppTextInput";

const fields = [
  {
    title: "Name",
    name: "name",
    placeholder: "e.g. John Doe",
    icon: require("@/assets/icons/person.png"),
    returnKeyType: "next" as const,
    autoCapitalize: "words" as const,
    maxLength: 50,
  },
  {
    title: "Email",
    name: "email",
    placeholder: "example@email.com",
    icon: require("@/assets/icons/email.png"),
    keyboardType: "email-address" as const,
    inputMode: "email" as const,
    returnKeyType: "next" as const,
    autoCapitalize: "none" as const,
    maxLength: 254,
  },
  {
    title: "Password",
    name: "password",
    placeholder: "e.g. ••••••••",
    icon: require("@/assets/icons/lock.png"),
    secureTextEntry: true,
    returnKeyType: "done" as const,
    autoCapitalize: "none" as const,
    maxLength: 128,
  },
];

type SignUpFormFieldsProps = {
  control: any;
  errors?: Record<string, { message?: string }>;
};

export default function SignUpFormFields({
  control,
  errors,
}: SignUpFormFieldsProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  return (
    <View className="w-full gap-4">
      {fields.map((field, index) => (
        <View key={field.name}>
          <AppTextInput
            control={control}
            {...field}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            onSubmitEditing={() => {
              const nextRef = inputRefs.current[index + 1];
              if (nextRef) {
                nextRef.focus();
              } else {
                Keyboard.dismiss();
              }
            }}
          />
          {errors?.[field.name]?.message && (
            <Text className="text-red-500 text-sm mt-1 ml-2">
              {errors[field.name].message}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
