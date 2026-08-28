import { Modal, Pressable, View, StyleSheet } from "react-native";
import type { ReactNode } from "react";

type AppDialogProps = {
  visible: boolean;
  onClose?: () => void;
  children: ReactNode;
  animationType?: "fade" | "none" | "slide";
  /** When false, tapping the backdrop or the hardware back button won't
   *  dismiss — the caller must close it explicitly. Defaults to true. */
  dismissOnBackdrop?: boolean;
};

export function AppDialog({
  visible,
  onClose,
  children,
  animationType = "fade",
  dismissOnBackdrop = true,
}: AppDialogProps) {
  const handleDismiss = dismissOnBackdrop ? onClose : undefined;
  return (
    <Modal
      transparent
      animationType={animationType}
      visible={visible}
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={handleDismiss} />
        <View style={styles.dialog}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  backdrop: {
    position: "absolute",
    inset: 0,
  },
  dialog: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 20,
    alignItems: "center",
  },
});
