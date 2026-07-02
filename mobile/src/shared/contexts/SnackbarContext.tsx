import { createContext, useContext, useState, useCallback, useRef } from "react";
import { Animated, Text, StyleSheet } from "react-native";
import type { ReactNode } from "react";

type SnackbarContextType = {
  show: (text: string) => void;
};

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used within SnackbarProvider");
  return ctx;
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [opacity] = useState(() => new Animated.Value(0));
  const timerRef = useRef<number | null>(null);

  const show = useCallback(
    (text: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      setMessage(text);
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setMessage(""));
      }, 3000);
    },
    [opacity],
  );

  return (
    <SnackbarContext.Provider value={{ show }}>
      {children}
      {message ? (
        <Animated.View style={[styles.container, { opacity }]}>
          <Text style={styles.text} numberOfLines={2}>
            {message}
          </Text>
        </Animated.View>
      ) : null}
    </SnackbarContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  text: {
    color: "white",
    fontSize: 14,
    fontFamily: "Jakarta-Medium",
    textAlign: "center",
  },
});
