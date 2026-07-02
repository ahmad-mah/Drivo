import { View } from "react-native";

const OnboardingDots = ({
  currentIndex,
  total,
}: {
  currentIndex: number;
  total: number;
}) => {
  return (
    <View className="flex-row">
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          className={`m-1 h-1.5 w-10 rounded-full ${
            index === currentIndex ? "bg-primary-500" : "bg-secondary-300"
          }`}
        />
      ))}
    </View>
  );
};

export default OnboardingDots;
