import { router } from "expo-router";

const NAV_LOCK_MS = 400;
const BACK_LOCK_MS = 300;

// Expo Router has no built-in duplicate-navigation guard, so a rapid second
// tap on any navigation target pushes/pops twice. These module-level
// timestamp locks (leading-edge) collapse those duplicate calls.
let lastNavAt = 0;
let lastBackAt = 0;

function lock(delayMs: number, key: "nav" | "back"): boolean {
  const now = Date.now();
  const last = key === "nav" ? lastNavAt : lastBackAt;
  if (now - last < delayMs) return false;
  if (key === "nav") lastNavAt = now;
  else lastBackAt = now;
  return true;
}

function guardedNav(action: () => void) {
  if (lock(NAV_LOCK_MS, "nav")) action();
}

function guardedBack(action: () => void) {
  if (lock(BACK_LOCK_MS, "back")) action();
}

export const Routes = {
  auth: {
    welcome: "/(app)/(auth)/welcome" as const,
    signIn: "/(app)/(auth)/sign-in" as const,
    signUp: "/(app)/(auth)/sign-up" as const,
  },
  root: {
    becomeDriver: "/(app)/(root)/become-driver" as const,
    driverProfile: "/(app)/(root)/driver-profile" as const,
    driverMode: "/(app)/(root)/driver-mode" as const,
    tabs: {
      home: "/(app)/(root)/(tabs)/home" as const,
    },
  },
} as const;

export function goToWelcome() {
  guardedNav(() => router.replace(Routes.auth.welcome));
}

export function goToSignIn() {
  guardedNav(() => router.push(Routes.auth.signIn));
}

export function replaceWithSignIn() {
  guardedNav(() => router.replace(Routes.auth.signIn));
}

export function goToSignUp() {
  guardedNav(() => router.push(Routes.auth.signUp));
}

export function replaceWithSignUp() {
  guardedNav(() => router.replace(Routes.auth.signUp));
}

export function goToHome() {
  guardedNav(() => router.replace(Routes.root.tabs.home));
}

export function goToBecomeDriver() {
  guardedNav(() => router.push(Routes.root.becomeDriver));
}

export function goToDriverProfile() {
  guardedNav(() => router.push(Routes.root.driverProfile));
}

export function goToDriverMode() {
  guardedNav(() => router.push(Routes.root.driverMode));
}

export function goBack() {
  guardedBack(() => router.back());
}
