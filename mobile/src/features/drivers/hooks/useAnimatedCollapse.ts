import { useState } from "react";
import { Animated } from "react-native";

interface UseAnimatedCollapseOptions {
  openDuration?: number;
  closeDuration?: number;
}

/**
 * Manages the open/close state and slide+fade animation for a collapsible
 * section (e.g. a dropdown list). The content is lazy-mounted — only rendered
 * after the first open — and unmounted after the close animation finishes.
 */
export function useAnimatedCollapse({
  openDuration = 180,
  closeDuration = 150,
}: UseAnimatedCollapseOptions = {}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [anim] = useState(() => new Animated.Value(0));

  const openSection = () => {
    setMounted(true);
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: openDuration,
      useNativeDriver: true,
    }).start();
  };

  const closeSection = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: closeDuration,
      useNativeDriver: true,
    }).start(() => setMounted(false));
  };

  const toggle = () => {
    if (open) {
      setOpen(false);
      closeSection();
    } else {
      setOpen(true);
      openSection();
    }
  };

  const close = () => {
    setOpen(false);
    closeSection();
  };

  const animatedStyle = {
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-8, 0],
        }),
      },
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.98, 1],
        }),
      },
    ],
  };

  return { open, mounted, toggle, close, animatedStyle };
}
