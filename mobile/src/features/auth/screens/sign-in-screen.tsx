import { AppButton, AppForm, AppGap, OrDivider } from "@/shared/components";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { TextActionRow } from "../components/TextActionRow";
import { View } from "react-native";
import { replaceWithSignUp } from "@/shared/services/navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm } from "react-hook-form";
import { SignInForm } from "../types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import signInSchema from "../schema/sign-in";
import SignInFormFields from "../components/SignInFormFields";
import AuthHeaderImage from "../components/AuthHeaderImage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSignInFlow } from "../hooks/useSignInFlow";
import { formatAuthErrorMessages } from "../utils/format-auth-error";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";

export default function SignInScreen() {
  const { bottom } = useSafeAreaInsets();
  const { signIn, isLoading, authError } = useSignInFlow();

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInForm) => {
    await signIn({ email: data.email, password: data.password });
  };

  useErrorSnackbar(formatAuthErrorMessages(authError));

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
        <AppForm form={form}>
          <SignInFormFields />
        </AppForm>
        <AppGap height={22} />
        <AppButton title="Log in" onPress={form.handleSubmit(onSubmit)} loading={isLoading} />
        <AppGap height={12} />
        <OrDivider />
        <AppGap height={12} />
        <GoogleSignInButton />
        <AppGap height={24} />
        <TextActionRow
          text="Don't have an account?"
          action="Sign up"
          onAction={replaceWithSignUp}
        />
      </View>
    </KeyboardAwareScrollView>
  );
}
