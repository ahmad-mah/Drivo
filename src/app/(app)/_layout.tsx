import { Slot, Redirect, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { hasSeenOnboarding } from "@/features/onboarding/constants/onboarding.storage";

export default function AppGateLayout() {
  const [loading, setLoading] = useState(true);
  const [seenOnboarding, setSeenOnboarding] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const seen = await hasSeenOnboarding();
        setSeenOnboarding(seen);
      } finally {
        setLoading(false);
      }
    }

    checkOnboarding();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  const isOnboardingRoute = segments[1] === "onboarding";

  // User has NOT seen onboarding -> force onboarding
  if (!seenOnboarding && !isOnboardingRoute) {
    return <Redirect href="/(app)/onboarding" />;
  }

  // User already saw onboarding -> block onboarding route
  if (seenOnboarding && isOnboardingRoute) {
    return <Redirect href="/(app)/(auth)/welcome" />;
  }

  return <Slot />;
}