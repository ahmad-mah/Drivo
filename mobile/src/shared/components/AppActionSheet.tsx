import { useEffect, useState, type ReactNode } from "react";
import {
  Animated,
  Modal,
  Pressable,
  Text,
  View,
  Dimensions,
} from "react-native";

interface ActionSheetOption {
  label: string;
  icon: ReactNode;
  onPress: () => void;
}

interface AppActionSheetProps {
  visible: boolean;
  title?: string;
  options: ActionSheetOption[];
  onCancel: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

export function AppActionSheet({
  visible,
  title,
  options,
  onCancel,
}: AppActionSheetProps) {
  // Stable Animated.Value across renders (useState lazy init is the
  // react-hooks/refs-rule-sanctioned replacement for useRef(...).current).
  const [slideAnim] = useState(() => new Animated.Value(SCREEN_HEIGHT));
  const [mounted, setMounted] = useState(false);
  // Adjust state when `visible` flips instead of in an effect (React's
  // "you might not need an effect" pattern for deriving state from props).
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setMounted(true);
  }

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SCREEN_HEIGHT);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
  }, [visible, slideAnim]);

  if (!mounted) return null;

  return (
    <Modal transparent animationType="none" onRequestClose={onCancel}>
      <Pressable className="flex-1 bg-black/40 items-center justify-center" onPress={onCancel}>
        <Animated.View
          className="bg-white rounded-2xl w-4/5 shadow-2xl"
          style={{ transform: [{ translateY: slideAnim }] }}
        >
          <Pressable onPress={() => {}}>
            <View className="items-center pt-5 pb-3">
              {title && (
                <Text className="text-xl font-Jakarta-Bold text-secondary-900">
                  {title}
                </Text>
              )}
            </View>

            <View className="px-4 pb-2 gap-2">
              {options.map((option, index) => (
                <Pressable
                  key={index}
                  className="flex-row items-center gap-3 py-3.5 px-4 active:bg-general-500 rounded-xl border border-general-200"
                  onPress={() => {
                    option.onPress();
                    onCancel();
                  }}
                >
                  {option.icon}
                  <Text className="text-lg font-Jakarta-Medium text-secondary-900">
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="px-4 pb-5 pt-1">
              <Pressable
                className="items-center py-3 active:bg-general-500 rounded-xl"
                onPress={onCancel}
              >
                <Text className="text-lg font-Jakarta-SemiBold text-secondary-900">
                  Cancel
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
