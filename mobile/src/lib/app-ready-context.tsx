import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AppReadyContextValue {
  seenOnboarding: boolean;
  completeOnboarding: () => void;
}

const AppReadyCtx = createContext<AppReadyContextValue>({
  seenOnboarding: false,
  completeOnboarding: () => {},
});

export const useAppReady = () => useContext(AppReadyCtx);

interface AppReadyProviderProps {
  seenOnboarding: boolean;
  children: ReactNode;
}

export function AppReadyProvider({
  seenOnboarding: initialSeenOnboarding,
  children,
}: AppReadyProviderProps) {
  const [completedThisSession, setCompletedThisSession] = useState(false);
  const seenOnboarding = initialSeenOnboarding || completedThisSession;

  const completeOnboarding = useCallback(() => {
    setCompletedThisSession(true);
  }, []);

  const value = useMemo(
    () => ({ seenOnboarding, completeOnboarding }),
    [seenOnboarding, completeOnboarding],
  );

  return <AppReadyCtx value={value}>{children}</AppReadyCtx>;
}