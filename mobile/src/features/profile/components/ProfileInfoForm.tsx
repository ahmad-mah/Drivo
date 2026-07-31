import { useEffect } from "react";
import { View, Text } from "react-native";
import { useForm } from "react-hook-form";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppTextInput, AppButton, AppGap } from "@/shared/components";
import type { UserProfile } from "@/api/users/users.api";
import { useSnackbar } from "@/shared/contexts/SnackbarContext";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
}

interface ProfileInfoFormProps {
  user: UserProfile;
}

const editIcon = (
  <MaterialCommunityIcons name="pencil-outline" size={18} color="#858585" />
);

function buildUpdateProfileDTO(
  user: UserProfile,
  values: ProfileFormValues,
): Record<string, string> {
  const dto: Record<string, string> = {};
  if (values.firstName !== (user.firstName ?? ""))
    dto.firstName = values.firstName;
  if (values.lastName !== (user.lastName ?? ""))
    dto.lastName = values.lastName;
  if (values.phone !== (user.phone ?? "")) dto.phone = values.phone;
  return dto;
}

export function ProfileInfoForm({ user }: ProfileInfoFormProps) {
  const { show } = useSnackbar();
  const updateProfile = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting },
    reset,
  } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
    },
  });

  // defaultValues are cached on first render; resync when user refreshes
  useEffect(() => {
    reset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
    });
  }, [user, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    const dto = buildUpdateProfileDTO(user, values);

    if (Object.keys(dto).length === 0) return;

    await updateProfile(dto);
    reset(values);
    show("Profile updated", "success");
  };

  return (
    <View className="rounded-2xl bg-white p-5  shadow-sm">
      <AppTextInput
        control={control}
        name="firstName"
        title="First Name"
        placeholder="Enter your first name"
        autoCapitalize="words"
        iconEnd={editIcon}
      />

      <AppGap height={16} />

      <AppTextInput
        control={control}
        name="lastName"
        title="Last Name"
        placeholder="Enter your last name"
        autoCapitalize="words"
        iconEnd={editIcon}
      />

      <AppGap height={16} />

      <View className="w-full gap-2">
        <Text className="text-lg">Email</Text>
        <View className="py-3 px-4 gap-3 border rounded-3xl flex-row items-center bg-gray-200 border-gray-200">
          <Text className="font-Jakarta-Medium text-lg flex-1 text-gray-500">
            {user.email}
          </Text>
        </View>
      </View>

      <AppGap height={16} />

      <AppTextInput
        control={control}
        name="phone"
        title="Phone"
        placeholder="Enter your phone number"
        keyboardType="phone-pad"
        inputMode="tel"
        iconEnd={editIcon}
      />

      <AppGap height={20} />

      <AppButton
        title="Save Changes"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={!isDirty}
      />
    </View>
  );
}
