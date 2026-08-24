import { AppButton, AppImage } from "@/shared/components";
import { useGoogleSignInFlow } from "../hooks/useGoogleSignInFlow";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";

export function GoogleSignInButton() {
  const { signInWithGoogle, isLoading, authError } = useGoogleSignInFlow();

  const errorMessage = authError
    ? [
        ...authError.fieldErrors.map((fe) => fe.longMessage ?? fe.message),
        ...authError.globalErrors.map((ge) => ge.longMessage ?? ge.message),
      ].join("\n")
    : null;
  useErrorSnackbar(errorMessage);

  return (
    <AppButton
      title="Log In with Google"
      variant="outline"
      onPress={signInWithGoogle}
      loading={isLoading}
      icon={
        <AppImage
          source={require("@/assets/icons/google.png")}
          className="size-5"
        />
      }
    />
  );
}
