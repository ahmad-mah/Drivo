import { Redirect } from "expo-router";
import { useAppReady } from "./_layout";
import { getInitialRedirectPath } from "@/lib/onboarding-redirects";

export default function Index() {
  const { seenOnboarding } = useAppReady();
  const path = getInitialRedirectPath(seenOnboarding);
  return <Redirect href={path} />;
}
