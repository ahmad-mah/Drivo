import { AppButton, AppGap, OrDivider } from "@/shared/components";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { TextActionRow } from "../components/TextActionRow";
import { router } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { SignInForm } from "../types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import signInSchema from "../schema/sign-in";
import SignInFormFields from "../components/SignInFormFields";
import AuthHeaderImage from "../components/AuthHeaderImage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSignInFlow } from "../hooks/useSignInFlow";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";

export default function SignInScreen() {
  const { bottom } = useSafeAreaInsets();
  const goToSignUp = () => router.replace("/(app)/(auth)/sign-up");
  const { signIn, isLoading, authError } = useSignInFlow();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInForm) => {
    await signIn({ email: data.email, password: data.password });
  };

  const errorMessage = authError
    ? [
        ...authError.fieldErrors.map((fe) => fe.longMessage ?? fe.message),
        ...authError.globalErrors.map((ge) => ge.longMessage ?? ge.message),
      ].join("\n")
    : null;
  useErrorSnackbar(errorMessage);

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
      <AuthHeaderImage title="Welcome👋" />
      <View
        style={{ paddingBottom: bottom + 20 }}
        className="w-full px-6 items-center justify-start"
      >
        <SignInFormFields control={control} errors={errors} />
        <AppGap height={22} />
        <AppButton title="Log in" onPress={handleSubmit(onSubmit)} loading={isLoading} />
        <AppGap height={12} />
        <OrDivider />
        <AppGap height={12} />
        <GoogleSignInButton />
        <AppGap height={24} />
        <TextActionRow
          text="Don't have an account?"
          action="Sign up"
          onAction={goToSignUp}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}
