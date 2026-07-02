import { Redirect } from "expo-router";
import { useAppReady } from "@/lib/app-ready-context";
import { getInitialRedirectPath } from "@/lib/onboarding-redirects";

export default function Index() {
  const { seenOnboarding } = useAppReady();
  const path = getInitialRedirectPath(seenOnboarding);
  return <Redirect href={path} />;
}
