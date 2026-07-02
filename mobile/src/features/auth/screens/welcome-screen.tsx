import { AppButton, AppGap, OrDivider } from "@/shared/components";
import { WelcomeContent } from "../components/WelcomeContent";
import { WelcomeImage } from "../components/WelcomeImage";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { TextActionRow } from "../components/TextActionRow";
import { router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const { bottom } = useSafeAreaInsets();
  const goToSignUp = () => router.push("/(app)/(auth)/sign-up");
  const goToSignIn = () => router.push("/(app)/(auth)/sign-in");

  return (
    <View className="flex-1 justify-start">
      <WelcomeImage />
      <View
        className="w-full flex-1 px-6 items-center"
        style={{ paddingBottom: bottom }}
      >
        <WelcomeContent />
        <AppGap height={30} />
        <AppButton title="Sign Up" onPress={goToSignUp} />
        <AppGap height={12} />
        <OrDivider />
        <AppGap height={12} />
        <GoogleSignInButton />
        <AppGap height={24} />
        <TextActionRow
          text="Already have an account?"
          action="Log in"
          onAction={goToSignIn}
        />
      </View>
    </View>
  );
}
