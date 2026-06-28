import { Slot, Redirect, useSegments } from "expo-router";
import { useAppReady } from "@/lib/app-ready-context";
import {
  shouldRedirectToOnboarding,
  shouldRedirectFromOnboarding,
} from "@/lib/onboarding-redirects";

export default function AppGateLayout() {
  const { seenOnboarding } = useAppReady();
  const segments = useSegments();

  const isOnboardingRoute = segments[1] === "onboarding";

  if (shouldRedirectToOnboarding(seenOnboarding, isOnboardingRoute)) {
    return <Redirect href="/(app)/onboarding" />;
  }

  if (shouldRedirectFromOnboarding(seenOnboarding, isOnboardingRoute)) {
    return <Redirect href="/(app)/(auth)/welcome" />;
  }

  return <Slot />;
}
