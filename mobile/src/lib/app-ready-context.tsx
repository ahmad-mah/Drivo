import { createContext, useContext, type ReactNode } from "react";

export interface AppReadyContextValue {
  seenOnboarding: boolean;
}

const AppReadyCtx = createContext<AppReadyContextValue>({
  seenOnboarding: false,
});

export const useAppReady = () => useContext(AppReadyCtx);

interface AppReadyProviderProps {
  seenOnboarding: boolean;
  children: ReactNode;
}

export function AppReadyProvider({ seenOnboarding, children }: AppReadyProviderProps) {
  return (
    <AppReadyCtx value={{ seenOnboarding }}>
      {children}
    </AppReadyCtx>
  );
}