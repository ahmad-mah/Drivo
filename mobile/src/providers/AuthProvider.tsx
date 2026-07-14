import { registerTokenGetter } from "@/api/token-provider";
import { useAuth } from "@clerk/expo";
import { useEffect, type ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    registerTokenGetter(() => getToken());
  }, [getToken]);

  return <>{children}</>;
}
