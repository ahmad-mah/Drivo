import { useCallback } from "react";
import { updateProfile, type UpdateProfileDto } from "@/api/users/users.api";
import { useUserContext } from "@/providers/UserProvider";

export function useUpdateProfile() {
  const { refreshUser } = useUserContext();

  return useCallback(
    async (dto: UpdateProfileDto) => {
      await updateProfile(dto);
      await refreshUser();
    },
    [refreshUser],
  );
}
