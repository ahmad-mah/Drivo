import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppFormField, AppGap } from "@/shared/components";
import { profileFormFields } from "../constants/profileFormFields";

const editIcon = (
  <MaterialCommunityIcons name="pencil-outline" size={18} color="#858585" />
);

type ProfileFormFieldsProps = {
  email: string;
};

export function ProfileFormFields({ email }: ProfileFormFieldsProps) {
  return (
    <>
      <AppFormField {...profileFormFields[0]} iconEnd={editIcon} />

      <AppGap height={16} />

      <AppFormField {...profileFormFields[1]} iconEnd={editIcon} />

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

      <AppFormField {...profileFormFields[2]} iconEnd={editIcon} />
    </>
  );
}