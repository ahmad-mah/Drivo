import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import "../../global.css";
import { Stack } from "expo-router";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { createContext, useContext, useEffect, useState } from "react";
import { hasSeenOnboarding } from "@/features/onboarding/constants/onboarding.storage";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

interface AppReadyContext {
  fontsLoaded: boolean;
  seenOnboarding: boolean;
}

const AppReadyCtx = createContext<AppReadyContext>({
  fontsLoaded: false,
  seenOnboarding: false,
});

export const useAppReady = () => useContext(AppReadyCtx);

SplashScreen.setOptions({ duration: 600, fade: true });
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [seenOnboarding, setSeenOnboarding] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          Jakarta: require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
          "Jakarta-Bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
          "Jakarta-ExtraBold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
          "Jakarta-ExtraLight": require("../../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
          "Jakarta-Light": require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
          "Jakarta-Medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
          "Jakarta-SemiBold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
        });
      } catch (error) {
        console.log("Font loading failed:", error);
      }
    }

    async function initialize() {
      await prepare();
      const seen = await hasSeenOnboarding();
      setSeenOnboarding(seen);
      setReady(true);
      SplashScreen.hideAsync();
    }

    initialize();
  }, []);

  if (!ready) return null;

  return (
    <AppReadyCtx value={{ fontsLoaded: true, seenOnboarding }}>
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
    </AppReadyCtx>
  );
}
