import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { hasSeenOnboarding } from "@/features/onboarding/constants/onboarding.storage";

SplashScreen.setOptions({ duration: 600, fade: true });
SplashScreen.preventAutoHideAsync();

export function useAppInit() {
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

  return { ready, seenOnboarding };
}
