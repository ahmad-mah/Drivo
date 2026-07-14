import { useAuth } from "@clerk/expo";
import { useEffect, type ReactNode } from "react";
import { registerTokenGetter } from "@/api/token-provider";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    registerTokenGetter(() => getToken());
  }, [getToken]);

  return <>{children}</>;
}
