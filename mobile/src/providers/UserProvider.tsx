import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { getCurrentUser, type UserProfile } from "@/api/users/users.api";
import { toError } from "@/errors";
import { connectSocket } from "@/shared/services/socket";

interface UserContextValue {
  user: UserProfile | null;
  loading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((profile) => {
        if (!cancelled) {
          setUser(profile);
          void connectSocket();
        }
      })
      .catch((err) => {
        if (!cancelled) setError(toError(err, "Failed to fetch user"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getCurrentUser();
      setUser(profile);
    } catch (err) {
      setError(toError(err, "Failed to fetch user"));
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return ctx;
}
