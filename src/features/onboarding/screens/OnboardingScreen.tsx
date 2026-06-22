import { AppGap, AppSafeArea } from "@/shared/components";
import { useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import OnboardingDots from "../components/OnboardingDots";
import OnboardingItem from "../components/OnboardingItem";
import { OnboardingSlide, onboardingSlides } from "../constants/constants";

export default function OnboardingScreen() {
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  return (
    <AppSafeArea className="items-center">
      <AppGap height={24} />
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {}}
        className="self-end"
      >
        <Text className="font-Jakarta-Bold text-lg">Skip</Text>
      </TouchableOpacity>
      <AppGap height={40} />
      <View className="h-[515]">
        <FlatList
          ref={flatListRef}
          data={onboardingSlides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <OnboardingItem item={item} width={width} />
          )}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={onScrollEnd}
        />
      </View>

      <OnboardingDots
        currentIndex={currentIndex}
        total={onboardingSlides.length}
      />

      <AppGap height={30} />

      <Pressable
        className="bg-primary-500 rounded-full w-full justify-center items-center py-4.5"
        onPress={() => {
          if (currentIndex === onboardingSlides.length - 1) return;
          flatListRef.current?.scrollToIndex({
            index: currentIndex + 1,
            animated: true,
          });
        }}
      >
        <Text className="text-lg text-secondary-200 font-Jakarta-SemiBold">
          {currentIndex !== onboardingSlides.length - 1
            ? "Next"
            : "Get Started"}
        </Text>
      </Pressable>
    </AppSafeArea>
  );
}
