import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import "../../global.css";
import { Stack } from "expo-router";
import { useAppInit } from "@/hooks/useAppInit";
import { AppReadyProvider } from "@/lib/app-ready-context";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

export default function RootLayout() {
  const { ready, seenOnboarding } = useAppInit();

  if (!ready) return null;

  return (
    <AppReadyProvider fontsLoaded seenOnboarding={seenOnboarding}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <Stack screenOptions={{ headerShown: false, statusBarStyle: "light" }}>
          <Stack.Screen
            name="(app)"
            options={{
              contentStyle: {
                backgroundColor: "#ffff",
              },
            }}
          />
        </Stack>
      </ClerkProvider>
    </AppReadyProvider>
  );
}
