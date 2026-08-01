import type { UserProfile } from "@/api/users/users.api";
import type { ProfileFormValues } from "@/features/profile/schema/profile.schema";

export function buildUpdateProfileDTO(
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
