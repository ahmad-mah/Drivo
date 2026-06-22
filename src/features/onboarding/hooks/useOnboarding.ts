import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { OnboardingSlide, onboardingSlides } from "../constants/constants";

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

  const onNext = useCallback(() => {
    if (isLastSlide) return;
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
  };
}
