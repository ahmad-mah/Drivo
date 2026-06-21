import "../../global.css";
import { Stack } from "expo-router";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

// keep splash visible immediately, before React renders
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);

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
      } finally {
        setReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(root)" />
    </Stack>
  );
}
