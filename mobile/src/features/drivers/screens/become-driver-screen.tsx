import { Pressable, View, Text } from "react-native";
import { FormProvider } from "react-hook-form";
import { goBack } from "@/shared/services/navigation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import {
  AppButton,
  AppGap,
  AppImage,
  AppSafeArea,
} from "@/shared/components";
import { useErrorSnackbar } from "@/hooks/useErrorSnackbar";
import { useDriverApplicationForm } from "../hooks/useDriverApplicationForm";
import { DriverApplicationForm } from "../components/DriverApplicationForm";
import { BecomeDriverLoading } from "../components/BecomeDriverLoading";

export default function BecomeDriverScreen() {
  const { bottom } = useSafeAreaInsets();
  const { form, onSubmit, isReapply, loading, submitting, error } =
    useDriverApplicationForm();

  useErrorSnackbar(error?.message ?? null);

  const handleSubmit = form.handleSubmit(async (data) => {
    if (await onSubmit(data)) {
      goBack();
    }
  });

  if (loading) {
    return <BecomeDriverLoading />;
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
        <View className="pt-4 pb-2">
          <Pressable
            onPress={goBack}
            className="rounded-full bg-white p-2.5 self-start"
          >
            <AppImage
              source={require("@/assets/icons/back-arrow.png")}
              className="size-6"
              tintColor="#333333"
            />
          </Pressable>
          <AppGap height={16} />
          <Text className="text-2xl font-Jakarta-Bold text-secondary-900">
            {isReapply ? "Re-apply to Drive" : "Apply to Drive"}
          </Text>
          <Text className="text-sm text-secondary-600 font-Jakarta-Regular mt-1">
            {isReapply
              ? "Update your details to resubmit your application"
              : "Fill in your details to start earning"}
          </Text>
        </View>

        <AppGap height={20} />
        <FormProvider {...form}>
          <DriverApplicationForm />
        </FormProvider>
        <AppGap height={24} />
        <AppButton
          title={isReapply ? "Re-submit Application" : "Submit Application"}
          onPress={handleSubmit}
          loading={submitting}
          disabled={!form.formState.isValid}
        />
        <View style={{ height: bottom + 20 }} />
      </KeyboardAwareScrollView>
    </AppSafeArea>
  );
}
