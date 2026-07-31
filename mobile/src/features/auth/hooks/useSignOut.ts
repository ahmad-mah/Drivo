import { useAuth } from "@clerk/expo";
import { goToWelcome } from "@/shared/services/navigation";

export function useSignOut() {
  const { signOut } = useAuth();

  return async () => {
    await signOut();
    goToWelcome();
  };
}
