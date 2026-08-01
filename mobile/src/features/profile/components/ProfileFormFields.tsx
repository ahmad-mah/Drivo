import { View, Text } from "react-native";
import type { Control, FieldErrors } from "react-hook-form";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppTextInput, AppGap } from "@/shared/components";
import type { ProfileFormValues } from "@/features/profile/schema/profile.schema";

const editIcon = (
  <MaterialCommunityIcons name="pencil-outline" size={18} color="#858585" />
);

type FieldConfig = {
  name: keyof ProfileFormValues;
  title: string;
  placeholder: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad" | "email-address";
  inputMode?: "text" | "tel" | "email";
};

const fields: FieldConfig[] = [
  {
    name: "firstName",
    title: "First Name",
    placeholder: "Enter your first name",
    autoCapitalize: "words",
  },
  {
    name: "lastName",
    title: "Last Name",
    placeholder: "Enter your last name",
    autoCapitalize: "words",
  },
  {
    name: "phone",
    title: "Phone",
    placeholder: "Enter your phone number",
    keyboardType: "phone-pad",
    inputMode: "tel",
  },
];

type ProfileFormFieldsProps = {
  control: Control<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  email: string;
};

export function ProfileFormFields({
  control,
  errors,
  email,
}: ProfileFormFieldsProps) {
  const renderField = (field: FieldConfig) => (
    <View key={field.name} className="w-full">
      <AppTextInput
        control={control}
        name={field.name}
        title={field.title}
        placeholder={field.placeholder}
        autoCapitalize={field.autoCapitalize}
        keyboardType={field.keyboardType}
        inputMode={field.inputMode}
        iconEnd={editIcon}
      />
      {errors[field.name]?.message && (
        <Text className="text-red-500 text-sm mt-1 ml-2">
          {errors[field.name]?.message}
        </Text>
      )}
    </View>
  );

  return (
    <>
      {renderField(fields[0])}

      <AppGap height={16} />

      {renderField(fields[1])}

      <AppGap height={16} />

      <View className="w-full gap-2">
        <Text className="text-lg">Email</Text>
        <View className="py-3 px-4 gap-3 border rounded-3xl flex-row items-center bg-gray-200 border-gray-200">
          <Text className="font-Jakarta-Medium text-lg flex-1 text-gray-500">
            {email}
          </Text>
        </View>
      </View>

      <AppGap height={16} />

      {renderField(fields[2])}
    </>
  );
}
