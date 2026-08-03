import type { UserProfile } from "@/api/users/users.api";

/**
 * The backend snapshots personal info (name + phone) from the User profile
 * when a driver application is submitted, so first-time applicants must have
 * these fields completed before the apply flow is shown.
 */
export function hasCompleteProfile(user: UserProfile | null): boolean {
  return Boolean(
    user &&
      user.firstName?.trim() &&
      user.lastName?.trim() &&
      user.phone?.trim(),
  );
}

/** Returns the labels of the profile fields that are still empty, for messaging. */
export function getMissingProfileFields(user: UserProfile | null): string[] {
  if (!user) return ["name", "phone"];
  const missing: string[] = [];
  if (!user.firstName?.trim() || !user.lastName?.trim()) missing.push("name");
  if (!user.phone?.trim()) missing.push("phone");
  return missing;
}
