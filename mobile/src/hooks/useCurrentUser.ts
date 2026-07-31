import { useUserContext } from "@/providers/UserProvider";

export function useCurrentUser() {
  const { user, loading, error, refreshUser } = useUserContext();
  return { user, loading, error, refreshUser };
}
