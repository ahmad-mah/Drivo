import { Image, Modal, Pressable, View } from "react-native";

interface ProfileImagePreviewProps {
  imageUrl: string | null;
  visible: boolean;
  onClose: () => void;
}

export function ProfileImagePreview({ imageUrl, visible, onClose }: ProfileImagePreviewProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 bg-black/90 items-center justify-center"
        onPress={onClose}
      >
        <View className="size-80">
          <Image
            source={
              imageUrl
                ? { uri: imageUrl }
                : require("@/assets/images/profile-placeholder.png")
            }
            className="size-80 rounded-full"
            resizeMode="cover"
          />
        </View>
      </Pressable>
    </Modal>
  );
}
