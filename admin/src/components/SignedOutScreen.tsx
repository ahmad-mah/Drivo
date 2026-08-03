import { SignInButton } from "@clerk/react";

export function SignedOutScreen() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6">
      <p className="text-sm text-gray-500">
        Sign in with an admin account to manage driver applications.
      </p>
      <SignInButton />
    </div>
  );
}
