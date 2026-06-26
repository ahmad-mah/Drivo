import { AppButton, AppGap, OrDivider } from "@/shared/components";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { TextActionRow } from "../components/TextActionRow";
import { router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { SignUpForm } from "../types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import signUpSchema from "../schema/sign-up";
import SignUpFormFields from "../components/SignUpFormFields";
import AuthHeaderImage from "../components/AuthHeaderImage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function SignUpScreen() {
  const { bottom } = useSafeAreaInsets();
  const goToSignIn = () => router.push("/(app)/(auth)/sign-in");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignUpForm) => {
    console.log(data);
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid
      extraScrollHeight={40}
    >
      <AuthHeaderImage title="Create Your Account" />
      <View
        style={{ paddingBottom: bottom + 20 }}
        className="w-full px-6 items-center justify-start"
      >
        <SignUpFormFields control={control} errors={errors} />
        <AppGap height={22} />
        <AppButton title="Sign Up" onPress={handleSubmit(onSubmit)} />
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
    </KeyboardAwareScrollView>
  );
}
