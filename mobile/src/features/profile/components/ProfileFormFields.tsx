import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppFormField, AppGap } from "@/shared/components";
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
  email: string;
};

export function ProfileFormFields({ email }: ProfileFormFieldsProps) {
  return (
    <>
      <AppFormField {...fields[0]} iconEnd={editIcon} />

      <AppGap height={16} />

      <AppFormField {...fields[1]} iconEnd={editIcon} />

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

      <AppFormField {...fields[2]} iconEnd={editIcon} />
    </>
  );
}
