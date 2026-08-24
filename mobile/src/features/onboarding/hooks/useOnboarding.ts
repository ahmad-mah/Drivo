import { useCallback, useRef, useState } from "react";
import { useAppReady } from "@/lib/app-ready-context";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from "react-native";
import {
  OnboardingSlide,
  onboardingSlides,
} from "../constants/onboarding.data";
import { markOnboardingSeen } from "../constants/onboarding.storage";

export function useOnboarding() {
  const { completeOnboarding } = useAppReady();
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();

  const isLastSlide = currentIndex === onboardingSlides.length - 1;

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };
  const finishOnboarding = useCallback(async () => {
    await markOnboardingSeen();
    completeOnboarding();
  }, [completeOnboarding]);

  const onSkip = finishOnboarding;

  const onNext = useCallback(async () => {
    if (isLastSlide) {
      await finishOnboarding();
      return;
    }
    flatListRef.current?.scrollToIndex({
      index: currentIndex + 1,
      animated: true,
    });
  }, [currentIndex, isLastSlide, finishOnboarding]);

  return {
    flatListRef,
    currentIndex,
    width,
    isLastSlide,
    onScrollEnd,
    onNext,
    totalSlides: onboardingSlides.length,
    onSkip,
  };
}
