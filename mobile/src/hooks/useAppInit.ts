import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { Image } from "expo-image";
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
        await Promise.all([
          Font.loadAsync({
            Jakarta: require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
            "Jakarta-Bold": require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
            "Jakarta-ExtraBold": require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
            "Jakarta-ExtraLight": require("../../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
            "Jakarta-Light": require("../../assets/fonts/PlusJakartaSans-Light.ttf"),
            "Jakarta-Medium": require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
            "Jakarta-SemiBold": require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
          }),
          Asset.loadAsync([
            require("@/assets/icons/marker.png"),
            require("@/assets/icons/selected-marker.png"),
            require("@/assets/icons/pin.png"),
            require("@/assets/icons/point.png"),
            require("@/assets/icons/target.png"),
            require("@/assets/icons/to.png"),
            require("@/assets/icons/star.png"),
            require("@/assets/icons/person.png"),
            require("@/assets/icons/search.png"),
            require("@/assets/icons/map.png"),
            require("@/assets/icons/home.png"),
            require("@/assets/icons/profile.png"),
            require("@/assets/icons/list.png"),
            require("@/assets/icons/chat.png"),
            require("@/assets/icons/back-arrow.png"),
            require("@/assets/icons/out.png"),
            require("@/assets/icons/arrow-down.png"),
            require("@/assets/icons/check.png"),
          ]),
          // Warm expo-image's own cache so map markers never snapshot a
          // not-yet-decoded icon (expo-asset preload above does not cover it).
          Image.loadAsync(require("@/assets/icons/marker.png")),
          Image.loadAsync(require("@/assets/icons/selected-marker.png")),
        ]);
      } catch (error) {
        console.log("App asset/font preloading failed:", error);
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
