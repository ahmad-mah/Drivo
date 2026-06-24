import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "hasSeenOnboarding";


export async function markOnboardingSeen() {
  await AsyncStorage.setItem(ONBOARDING_KEY, "true");
}


export async function hasSeenOnboarding() {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === "true";
}