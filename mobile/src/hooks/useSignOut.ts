import { useCallback } from "react";
import { useAuth } from "@clerk/expo";
import { goToWelcome } from "@/shared/services/navigation";

export function useSignOut() {
  const { signOut } = useAuth();

  return useCallback(async () => {
    await signOut();
    goToWelcome();
  }, [signOut]);
}
