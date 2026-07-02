import { Modal, Pressable, View, StyleSheet } from "react-native";
import type { ReactNode } from "react";

type AppDialogProps = {
  visible: boolean;
  onClose?: () => void;
  children: ReactNode;
};

export function AppDialog({ visible, onClose, children }: AppDialogProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.dialog}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
  },
  dialog: {
    backgroundColor: "white",
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 30,

    borderRadius: 16,
    alignItems: "center",
  },
});
