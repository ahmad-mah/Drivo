import { useAuth } from "@clerk/react";
import { useEffect, type ReactNode } from "react";
import { registerTokenGetter } from "./token-provider";

export function AuthBridge({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    registerTokenGetter(() => getToken());
  }, [getToken]);

  return <>{children}</>;
}
