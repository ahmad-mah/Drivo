import { StripeProvider } from "@stripe/stripe-react-native";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import "../../global.css";
import { Stack, usePathname, type ErrorBoundaryProps } from "expo-router";
import { useState } from "react";
import { useAppInit } from "@/hooks/useAppInit";
import { AppReadyProvider } from "@/lib/app-ready-context";
import { SnackbarProvider } from "@/shared/contexts/SnackbarContext";
import { AuthProvider } from "@/providers/AuthProvider";
import { ConnectivityProvider } from "@/providers/ConnectivityProvider";
import { useConnectivity } from "@/hooks/useConnectivity";
import { OfflineScreen } from "@/shared/components/OfflineScreen";
import { RootErrorFallback } from "@/shared/components/RootErrorFallback";
import "@/api/interceptors";
// Registers the expo-task-manager task at module scope — Must run before any
// startLocationUpdatesAsync call (including from a cold boot into the task).
import "@/features/drivers/services/driver-location-task";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const stripePublishableKey =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Any unexpected render error anywhere in the tree falls back to a recoverable
// screen instead of a silent crash.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <RootErrorFallback error={error} retry={retry} />;
}

export default function RootLayout() {
  const { ready, seenOnboarding } = useAppInit();

  if (!ready) return null;

  return (
    <AppReadyProvider seenOnboarding={seenOnboarding}>
      <ConnectivityProvider>
        <SnackbarProvider>
          <AppContent />
        </SnackbarProvider>
      </ConnectivityProvider>
    </AppReadyProvider>
  );
}

function AppContent() {
  const { status } = useConnectivity();
  const pathname = usePathname();
  // Latches true the first time connectivity is confirmed. After that, the
  // auth tree is never unmounted again on transient drops — remounting
  // Clerk + expo-router mid-hydration on flaky mobile networks churns
  // synchronous re-renders fast enough to trip React's update-depth limit.
  const [everOnline] = useState(status === "online");
  const offline = status === "no-internet" || status === "server-down";

  // Startup-only gate: the authenticated tree (Clerk + auth + router) mounts
  // only once the API (or internet behind it) is confirmed reachable, so Clerk
  // never hydrates against a dead network. Before that first success, a drop
  // still shows the global offline screen.
  if (status === "checking") return null;
  if (offline && !everOnline && pathname !== "/driver-mode") {
    return <OfflineScreen />;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <StripeProvider publishableKey={stripePublishableKey} merchantIdentifier="merchant.com.drivo.app">
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              statusBarStyle: "dark",
              contentStyle: { backgroundColor: "white" },
            }}
          >
            <Stack.Screen name="(app)" />
          </Stack>
        </AuthProvider>
      </StripeProvider>
    </ClerkProvider>
  );
}
