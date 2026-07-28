import { useAuth } from "@clerk/expo";
import { router } from "expo-router";

export function useSignOut() {
  const { signOut } = useAuth();

  return () => {
    signOut();
    router.replace("/(app)/(auth)/welcome");
  };
}
