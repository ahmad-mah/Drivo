import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
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
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();

  const isLastSlide = currentIndex === onboardingSlides.length - 1;

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };
  const onSkip = async () => {
    await markOnboardingSeen();
    router.replace("/(app)/(auth)/welcome");
  };

  const onNext = useCallback(async () => {
    if (isLastSlide) {
      await onSkip();
      return;
    }
    flatListRef.current?.scrollToIndex({
      index: currentIndex + 1,
      animated: true,
    });
  }, [currentIndex, isLastSlide]);

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
