import { useState } from "react";
import { View, Image, Pressable } from "react-native";
import { ProfileImagePreview } from "@/features/profile/components/ProfileImagePreview";
import { useProfileImage } from "@/hooks/useProfileImage";
import {
  AppActionSheet,
  ActionSheetIcon,
  AppImage,
} from "@/shared/components";

interface ProfileAvatarProps {
  imageUrl: string | null;
}

export function ProfileAvatar({ imageUrl }: ProfileAvatarProps) {
  const { pickImage } = useProfileImage();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);

  const actionSheetOptions = [
    {
      label: "Camera",
      icon: <ActionSheetIcon name="camera" size={24} color="#666" />,
      onPress: () => pickImage(true),
    },
    {
      label: "Gallery",
      icon: <ActionSheetIcon name="image-multiple-outline" size={24} color="#666" />,
      onPress: () => pickImage(false),
    },
  ];

  return (
    <View className="items-center">
      <AppActionSheet
        visible={actionSheetVisible}
        title="Change Profile Photo"
        options={actionSheetOptions}
        onCancel={() => setActionSheetVisible(false)}
      />

      <ProfileImagePreview
        imageUrl={imageUrl}
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
      />

      <View className="size-28">
        <Pressable onPress={() => setPreviewVisible(true)}>
          <Image
            source={
              imageUrl
                ? { uri: imageUrl }
                : require("@/assets/images/profile-placeholder.png")
            }
            className="size-28 rounded-full bg-general-200 border-4 border-white"
            resizeMode="cover"
          />
        </Pressable>
        <Pressable
          className="absolute bottom-1 inset-e-1 size-6 p-4 rounded-full bg-white items-center justify-center elevation-sm shadow-sm"
          onPress={() => setActionSheetVisible(true)}
          hitSlop={4}
        >
          <AppImage
            className="size-5"
            source={require("@/assets/icons/gallery-edit.png")}
          />
        </Pressable>
      </View>
    </View>
  );
}
