import * as ImagePicker from "expo-image-picker";

const pickerDefaults = {
  allowsEditing: true,
  aspect: [1, 1] as [number, number],
  quality: 0.8,
};

export async function requestCameraPermission() {
  return ImagePicker.requestCameraPermissionsAsync();
}

export async function requestGalleryPermission() {
  return ImagePicker.requestMediaLibraryPermissionsAsync();
}

export async function pickFromCamera() {
  return ImagePicker.launchCameraAsync(pickerDefaults);
}

export async function pickFromGallery() {
  return ImagePicker.launchImageLibraryAsync(pickerDefaults);
}

export async function uriToBlob(uri: string) {
  const response = await fetch(uri);
  return response.blob();
}
