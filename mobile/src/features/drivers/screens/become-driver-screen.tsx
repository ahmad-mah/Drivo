import { View, Text } from "react-native";
import { goBack } from "@/shared/services/navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  AppButton,
  AppForm,
  AppGap,
  AppLoadingOverlay,
  AppSafeArea,
} from "@/shared/components";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import { useSnackbar } from "@/shared/contexts/SnackbarContext";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { hasCompleteProfile, getMissingProfileFields } from "@/shared/utils/profile";
import { useDriverApplicationForm } from "../hooks/useDriverApplicationForm";
import { DriverApplicationForm } from "../components/DriverApplicationForm";
import { DriverRequirements } from "../components/DriverRequirements";
import { BecomeDriverLoading } from "../components/BecomeDriverLoading";
import { BecomeDriverHeader } from "../components/BecomeDriverHeader";

export default function BecomeDriverScreen() {
  const { bottom } = useSafeAreaInsets();
  const { show } = useSnackbar();
  const { user, loading: userLoading } = useCurrentUser();
  const {
    form,
    onSubmit,
    isReapply,
    isVehicleChange,
    isFirstTime,
    loading,
    submitting,
    error,
  } = useDriverApplicationForm();

  useErrorSnackbar(error?.message ?? null);

  const handleSubmit = form.handleSubmit(async (data) => {
    if (await onSubmit(data)) {
      show(
        isVehicleChange
          ? "Vehicle updated. Your application is under review again."
          : isReapply
            ? "Application re-submitted. Your details are under review."
            : "Application submitted successfully. You're under review.",
        "success",
      );
      goBack();
    }
  });

  if (loading || userLoading) {
    return <BecomeDriverLoading />;
  }

  if (isFirstTime && !hasCompleteProfile(user)) {
    const missing = getMissingProfileFields(user).join(" and ");
    return (
      <AppSafeArea>
        <BecomeDriverHeader
          isReapply={false}
          isVehicleChange={false}
          onBack={goBack}
        />
        <AppGap height={20} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-lg font-Jakarta-Bold text-secondary-900">
            Complete your profile first
          </Text>
          <AppGap height={8} />
          <Text className="text-center text-sm text-secondary-600 font-Jakarta-Regular">
            {`Add your ${missing} to your profile before applying to drive.`}
          </Text>
        </View>
        <View style={{ height: bottom + 20 }} />
      </AppSafeArea>
    );
  }

  return (
    <AppSafeArea>
      <KeyboardAwareScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={40}
        contentContainerClassName="pb-8"
      >
        <BecomeDriverHeader
          isReapply={isReapply}
          isVehicleChange={isVehicleChange}
          onBack={goBack}
        />

        <AppGap height={20} />
        <DriverRequirements />
        <AppGap height={16} />
        <AppForm form={form}>
          <DriverApplicationForm />
        </AppForm>
        <AppGap height={24} />
        <AppButton
          title={
            isReapply
              ? "Re-submit Application"
              : isVehicleChange
                ? "Submit Vehicle Update"
                : "Submit Application"
          }
          onPress={handleSubmit}
          loading={submitting}
        />
        <View style={{ height: bottom + 20 }} />
      </KeyboardAwareScrollView>

      <AppLoadingOverlay visible={submitting} label="Submitting application…" />
    </AppSafeArea>
  );
}
