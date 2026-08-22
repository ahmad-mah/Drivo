"use no memo";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UserProfile } from "@/api/users/users.api";
import { useSnackbar } from "@/shared/contexts/SnackbarContext";
import { getErrorMessage } from "@/errors";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import {
  updateProfileSchema,
  type ProfileFormValues,
} from "@/features/profile/schema/profile.schema";
import { buildUpdateProfileDTO } from "@/features/profile/utils/profile.dto";

export function useProfileForm(user: UserProfile) {
  const { show } = useSnackbar();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
    },
  });

  // defaultValues are cached on first render; resync when user refreshes
  useEffect(() => {
    form.reset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
    });
  }, [user, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    const dto = buildUpdateProfileDTO(user, values);

    if (Object.keys(dto).length === 0) return;

    try {
      await updateProfile(dto);
      form.reset(values);
      show("Profile updated", "success");
    } catch (err) {
      show(getErrorMessage(err, "Failed to update profile"));
    }
  };

  return {
    form,
    onSubmit,
    isDirty: form.formState.isDirty,
    isSubmitting: form.formState.isSubmitting,
  };
}