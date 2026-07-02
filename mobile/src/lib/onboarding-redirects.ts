export function getInitialRedirectPath(seenOnboarding: boolean): "/(app)/(auth)/welcome" | "/(app)/onboarding" {
  return seenOnboarding ? "/(app)/(auth)/welcome" : "/(app)/onboarding";
}

export function shouldRedirectToOnboarding(seenOnboarding: boolean, isOnboardingRoute: boolean): boolean {
  return !seenOnboarding && !isOnboardingRoute;
}

export function shouldRedirectFromOnboarding(seenOnboarding: boolean, isOnboardingRoute: boolean): boolean {
  return seenOnboarding && isOnboardingRoute;
}
