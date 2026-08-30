import { SignInButton } from "@clerk/react";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export function SignedOutScreen() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-primary p-4">
      <div className="glass-strong w-full max-w-md rounded-3xl p-8 text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 animate-slide-down">
          <Shield className="h-8 w-8 text-brand-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary animate-slide-up stagger-1">
          {t("signedOut.title", "Drivo Admin Panel")}
        </h1>
        <p className="mt-2 text-sm text-text-secondary animate-slide-up stagger-2">
          {t("signedOut.subtitle", "Sign in to access the admin dashboard")}
        </p>
        <div className="mt-8 animate-slide-up stagger-3">
          <SignInButton mode="modal">
            <button className="w-full rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all duration-300 hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.98]">
              {t("signedOut.signIn", "Sign In")}
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
