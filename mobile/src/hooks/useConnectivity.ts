import { useContext } from "react";
import { ConnectivityContext } from "@/providers/ConnectivityProvider";

export function useConnectivity() {
  const value = useContext(ConnectivityContext);
  if (!value) {
    throw new Error("useConnectivity must be used within ConnectivityProvider");
  }
  return value;
}