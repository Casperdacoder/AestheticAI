import { Alert, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";

const MEDIA_TYPE_IMAGES =
  ImagePicker?.MediaType?.IMAGES ??
  ImagePicker?.MediaType?.Images ??
  (ImagePicker?.MediaTypeOptions?.Images
    ? "images"
    : "images");

const openSettings = () => {
  if (typeof Linking.openSettings === "function") {
    Linking.openSettings().catch(() => {});
  }
};

const sleep = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

const hasLibraryAccess = permission =>
  permission?.granted ||
  permission?.status === "granted" ||
  permission?.accessPrivileges === "limited";

const showPermissionAlert = (title, message, allowSettings) => {
  const buttons = allowSettings
    ? [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: openSettings },
      ]
    : [{ text: "OK" }];
  Alert.alert(title, message, buttons);
};

export const ensureCameraPermission = async () => {
  try {
    const current = await ImagePicker.getCameraPermissionsAsync();
    if (current?.granted || current?.status === "granted") {
      return { granted: true, justGranted: false };
    }

    const requested = await ImagePicker.requestCameraPermissionsAsync();
    if (requested?.granted || requested?.status === "granted") {
      return { granted: true, justGranted: true };
    }

    showPermissionAlert(
      "Camera permission needed",
      "Camera access is required to take photos.",
      !requested?.canAskAgain
    );
    return { granted: false, justGranted: false };
  } catch (error) {
    console.warn("Camera permission error", error);
    Alert.alert("Camera error", error?.message ?? "Unable to request camera access.");
    return { granted: false, justGranted: false };
  }
};

export const ensureMediaLibraryPermission = async () => {
  try {
    const current = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (hasLibraryAccess(current)) {
      return { granted: true, justGranted: false };
    }

    const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (hasLibraryAccess(requested)) {
      await sleep();
      return { granted: true, justGranted: true };
    }

    showPermissionAlert(
      "Photo library access needed",
      "Photo access is required to choose images.",
      !requested?.canAskAgain
    );
    return { granted: false, justGranted: false };
  } catch (error) {
    console.warn("Media library permission error", error);
    Alert.alert("Gallery error", error?.message ?? "Unable to request photo access.");
    return { granted: false, justGranted: false };
  }
};

export { MEDIA_TYPE_IMAGES };
