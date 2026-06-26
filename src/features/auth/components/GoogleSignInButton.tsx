import { AppButton, AppImage } from "@/shared/components";

export function GoogleSignInButton() {
  return (
    <AppButton
      title="Log In with Google"
      variant="outline"
      icon={<AppImage source={require("@/assets/icons/google.png")} className="size-5" />}
    />
  );
}
