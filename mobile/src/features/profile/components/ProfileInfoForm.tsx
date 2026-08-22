import { View } from "react-native";
import { AppButton, AppForm, AppGap, AppLoadingOverlay } from "@/shared/components";
import type { UserProfile } from "@/api/users/users.api";
import { useProfileForm } from "../hooks/useProfileForm";
import { ProfileFormFields } from "./ProfileFormFields";

interface ProfileInfoFormProps {
  user: UserProfile;
}

export function ProfileInfoForm({ user }: ProfileInfoFormProps) {
  const { form, onSubmit, isDirty, isSubmitting } = useProfileForm(user);

  return (
    <View className="rounded-2xl bg-white p-5  shadow-sm">
      <AppForm form={form}>
        <ProfileFormFields email={user.email} />

        <AppGap height={20} />

        <AppButton
          title="Save Changes"
          onPress={form.handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={!isDirty}
        />

        <AppLoadingOverlay visible={isSubmitting} label="Updating profile…" />
      </AppForm>
    </View>
  );
}