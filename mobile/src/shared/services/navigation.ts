import { router } from "expo-router";

export const Routes = {
  auth: {
    welcome: "/(app)/(auth)/welcome" as const,
    signIn: "/(app)/(auth)/sign-in" as const,
    signUp: "/(app)/(auth)/sign-up" as const,
  },
  root: {
    becomeDriver: "/(app)/(root)/become-driver" as const,
    tabs: {
      home: "/(app)/(root)/(tabs)/home" as const,
    },
  },
} as const;

export function goToWelcome() {
  router.replace(Routes.auth.welcome);
}

export function goToSignIn() {
  router.push(Routes.auth.signIn);
}

export function replaceWithSignIn() {
  router.replace(Routes.auth.signIn);
}

export function goToSignUp() {
  router.push(Routes.auth.signUp);
}

export function replaceWithSignUp() {
  router.replace(Routes.auth.signUp);
}

export function goToHome() {
  router.replace(Routes.root.tabs.home);
}

export function goToBecomeDriver() {
  router.push(Routes.root.becomeDriver);
}

export function goBack() {
  router.back();
}
