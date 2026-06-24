import { AppGap, AppSafeArea } from "@/shared/components";
import NextButton from "../components/NextButton";
import OnboardingDots from "../components/OnboardingDots";
import OnboardingSwiper from "../components/OnboardingSwiper";
import SkipButton from "../components/SkipButton";
import { onboardingSlides } from "../constants/onboarding.data";
import { useOnboarding } from "../hooks/useOnboarding";

export default function OnboardingScreen() {
  const {
    flatListRef,
    currentIndex,
    width,
    isLastSlide,
    onScrollEnd,
    onNext,
    totalSlides,
    onSkip,
  } = useOnboarding();

  return (
    <AppSafeArea className="items-center">
      <AppGap height={24} />
      <SkipButton onPress={onSkip} />
      <AppGap height={40} />

      <OnboardingSwiper
        flatListRef={flatListRef}
        data={onboardingSlides}
        width={width}
        onScrollEnd={onScrollEnd}
      />

      <OnboardingDots currentIndex={currentIndex} total={totalSlides} />

      <AppGap height={30} />

      <NextButton
        currentIndex={currentIndex}
        isLastSlide={isLastSlide}
        onNext={onNext}
      />
    </AppSafeArea>
  );
}
