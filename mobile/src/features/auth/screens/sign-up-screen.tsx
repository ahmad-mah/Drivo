import { AppButton, AppGap, AppDialog, OrDivider } from "@/shared/components";
import { GoogleSignInButton } from "../components/GoogleSignInButton";
import { TextActionRow } from "../components/TextActionRow";
import { useSignUpFlow } from "../hooks/useSignUpFlow";
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
import { VerifyEmailDialog } from "../components/VerifyEmailDialog";
import { SuccessDialog } from "../components/SuccessDialog";
import { useState } from "react";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";

export default function SignUpScreen() {
  const { bottom } = useSafeAreaInsets();
  const goToSignIn = () => router.replace("/(app)/(auth)/sign-in");
  const {
    register,
    verifyEmail,
    resendCode,
    finalize,
    isLoading,
    authError,
  } = useSignUpFlow();

  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showVerifiedDialog, setShowVerifiedDialog] = useState(false);
  const [code, setCode] = useState("");

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

  const onSubmit = async (data: SignUpForm) => {
    const ok = await register({
      email: data.email,
      password: data.password,
      firstName: data.name,
    });
    if (ok) {
      setShowOtpDialog(true);
    }
  };

  const handleVerify = async () => {
    const ok = await verifyEmail(code);
    if (ok) {
      setShowOtpDialog(false);
      setShowVerifiedDialog(true);
    }
  };

  const handleBrowseHome = async () => {
    await finalize();
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
      <AuthHeaderImage title="Create Your Account" />
      <View
        style={{ paddingBottom: bottom + 20 }}
        className="w-full px-6 items-center justify-start"
      >
        <SignUpFormFields control={control} errors={errors} />
        <AppGap height={22} />
        <AppButton
          title="Sign Up"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
        />
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

      <AppDialog visible={showOtpDialog}>
        <VerifyEmailDialog
          code={code}
          onCodeChange={setCode}
          onVerify={handleVerify}
          onResend={resendCode}
          isLoading={isLoading}
          authError={authError}
        />
      </AppDialog>

      <AppDialog visible={showVerifiedDialog}>
        <SuccessDialog onBrowseHome={handleBrowseHome} loading={isLoading} />
      </AppDialog>
    </KeyboardAwareScrollView>
  );
}
