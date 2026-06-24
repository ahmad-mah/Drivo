import { Text, TouchableOpacity } from "react-native";

const SkipButton = ({ onPress }: { onPress?: () => void }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="self-end"
    >
      <Text className="font-Jakarta-Bold text-lg">Skip</Text>
    </TouchableOpacity>
  );
};

export default SkipButton;
