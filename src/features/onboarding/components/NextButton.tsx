import { Text, Pressable } from "react-native";

const NextButton = ({
  currentIndex,
  isLastSlide,
  onNext,
}: {
  currentIndex: number;
  isLastSlide: boolean;
  onNext: () => void;
}) => {
  return (
    <Pressable
      className="bg-primary-500 rounded-full w-full justify-center items-center py-4.5"
      onPress={onNext}
    >
      <Text className="text-lg text-secondary-200 font-Jakarta-SemiBold">
        {isLastSlide ? "Get Started" : "Next"}
      </Text>
    </Pressable>
  );
};

export default NextButton;
