import { useCallback, useState } from "react";
import { useUser } from "@clerk/expo";
import { updateProfile } from "@/api/users/users.api";
import { useUserContext } from "@/providers/UserProvider";
import {
  requestCameraPermission,
  requestGalleryPermission,
  pickFromCamera,
  pickFromGallery,
  uriToBlob,
} from "@/shared/services/image.service";

export function useProfileImage() {
  const { user: clerkUser } = useUser();
  const { refreshUser } = useUserContext();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickImage = useCallback(
    async (useCamera: boolean) => {
      const permission = useCamera
        ? await requestCameraPermission()
        : await requestGalleryPermission();

      if (!permission.granted) return;

      const result = useCamera ? await pickFromCamera() : await pickFromGallery();

      if (result.canceled || !result.assets?.[0]?.uri) return;

      setUploading(true);
      setError(null);
      try {
        const blob = await uriToBlob(result.assets[0].uri);
        const imageResource = await clerkUser?.setProfileImage({ file: blob });
        const newImageUrl = imageResource?.publicUrl;
        if (newImageUrl) {
          await updateProfile({ imageUrl: newImageUrl });
          await refreshUser();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update profile photo");
      } finally {
        setUploading(false);
      }
    },
    [clerkUser, refreshUser],
  );

  return { pickImage, uploading, error };
}
