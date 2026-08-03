import { View, TextInput } from "react-native";
import { useRef } from "react";
import { AppFormField } from "@/shared/components";

const fields = [
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

export default function SignInFormFields() {
  const inputRefs = useRef<(TextInput | null)[]>([]);

  return (
    <View className="w-full gap-4">
      {fields.map((field, index) => (
        <AppFormField
          key={field.name}
          {...field}
          inputRef={(el) => {
            inputRefs.current[index] = el;
          }}
          onSubmitEditing={() => {
            const nextRef = inputRefs.current[index + 1];
            if (nextRef) {
              nextRef.focus();
            }
          }}
        />
      ))}
    </View>
  );
}
