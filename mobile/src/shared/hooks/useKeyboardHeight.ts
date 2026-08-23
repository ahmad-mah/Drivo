import { useEffect, useState } from "react";
import { Keyboard, LayoutAnimation, Platform } from "react-native";

/**
 * Tracks the keyboard height and lets bottom-anchored content lift above it.
 * Manual tracking is deliberate: under Android edge-to-edge,
 * `softwareKeyboardLayoutMode: "resize"` does not resize the window, and
 * KeyboardAvoidingView needs per-platform behavior tuning — explicit height
 * is the one mechanism that behaves identically everywhere.
 */
export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const show = Keyboard.addListener(showEvent, (event) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardHeight(0);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return keyboardHeight;
}
