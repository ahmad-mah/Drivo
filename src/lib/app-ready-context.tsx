import { createContext, useContext, type ReactNode } from "react";

export interface AppReadyContextValue {
  fontsLoaded: boolean;
  seenOnboarding: boolean;
}

const AppReadyCtx = createContext<AppReadyContextValue>({
  fontsLoaded: false,
  seenOnboarding: false,
});

export const useAppReady = () => useContext(AppReadyCtx);

interface AppReadyProviderProps {
  fontsLoaded: boolean;
  seenOnboarding: boolean;
  children: ReactNode;
}

export function AppReadyProvider({ fontsLoaded, seenOnboarding, children }: AppReadyProviderProps) {
  return (
    <AppReadyCtx value={{ fontsLoaded, seenOnboarding }}>
      {children}
    </AppReadyCtx>
  );
}
