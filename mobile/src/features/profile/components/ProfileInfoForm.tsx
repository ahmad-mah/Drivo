import { useEffect } from "react";
import { View } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppButton, AppGap } from "@/shared/components";
import type { UserProfile } from "@/api/users/users.api";
import { useSnackbar } from "@/shared/contexts/SnackbarContext";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import {
  updateProfileSchema,
  type ProfileFormValues,
} from "@/features/profile/schema/profile.schema";
import { buildUpdateProfileDTO } from "@/features/profile/utils/profile.dto";
import { ProfileFormFields } from "./ProfileFormFields";

interface ProfileInfoFormProps {
  user: UserProfile;
}

export function ProfileInfoForm({ user }: ProfileInfoFormProps) {
  const { show } = useSnackbar();
  const updateProfile = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
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
      <ProfileFormFields control={control} errors={errors} email={user.email} />

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
