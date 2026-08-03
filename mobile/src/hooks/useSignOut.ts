import { useCallback, useState } from "react";
import { useAuth } from "@clerk/expo";
import { goToWelcome } from "@/shared/services/navigation";

export function useSignOut() {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signOut();
      goToWelcome();
    } finally {
      setLoading(false);
    }
  }, [signOut, loading]);

  return { handleSignOut, loading };
}
