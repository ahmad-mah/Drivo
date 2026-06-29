import { View, Text } from "react-native";
import { AppButton, AppGap } from "@/shared/components";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import AppTextInput from "./AppTextInput";
import type { AuthError } from "../domain/auth-error";

type VerifyEmailDialogProps = {
  code: string;
  onCodeChange: (code: string) => void;
  onVerify: () => void;
  onResend: () => void;
  isLoading: boolean;
  authError: AuthError | null;
};

export function VerifyEmailDialog({
  code,
  onCodeChange,
  onVerify,
  onResend,
  isLoading,
  authError,
}: VerifyEmailDialogProps) {
  const codeError = authError?.fieldErrors.find((f) => f.field === "code");
  useErrorSnackbar(codeError ? codeError.longMessage ?? codeError.message : null);

  return (
    <View className="w-full items-center gap-1 ">
      <Text className="text-2xl font-Jakarta-Bold text-center">
        Verification
      </Text>
      <Text className="text-base font-Jakarta-Medium text-gray-500 text-center">
        Enter the code sent to your email
      </Text>
      <AppGap height={20} />
      <AppTextInput
        value={code}
        onChangeText={onCodeChange}
        name="code"
        placeholder="000000"
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={6}
        textAlign="center"
      />
      <AppGap height={16} />
      <AppButton title="Verify" onPress={onVerify} loading={isLoading} />
      <AppGap height={12} />
      <Text
        className="text-[#0a7ea4] font-Jakarta-Medium text-base"
        onPress={onResend}
      >
        Resend code
      </Text>
    </View>
  );
}
