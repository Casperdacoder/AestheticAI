import React, { useState } from 'react';
import { Text, TouchableOpacity, Modal, StyleSheet, View, Alert } from 'react-native';
import { Screen, colors } from '../components/UI';
import * as ImagePicker from 'expo-image-picker';
import {
  ensureCameraPermission,
  ensureMediaLibraryPermission,
  MEDIA_TYPE_IMAGES,
} from '../utils/imagePickerHelpers';
import { Ionicons } from '@expo/vector-icons';

export default function UploadScreen({ navigation }) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const handleResult = (result) => {
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      navigation.navigate('DesignDetail', { uploadedUri: uri });
    }
  };

  const openCamera = async () => {
    const { granted } = await ensureCameraPermission();
    if (!granted) return;
    try {
      const res = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        mediaTypes: MEDIA_TYPE_IMAGES,
      });
      handleResult(res);
    } catch (error) {
      console.warn('ImagePicker camera error', error);
      Alert.alert('Camera error', error?.message ?? 'Unable to open the camera.');
    }
  };

  const openLibrary = async () => {
    const { granted } = await ensureMediaLibraryPermission();
    if (!granted) return;
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        quality: 0.85,
        mediaTypes: MEDIA_TYPE_IMAGES,
      });
      handleResult(res);
    } catch (error) {
      console.warn('ImagePicker library error', error);
      Alert.alert('Photo picker error', error?.message ?? 'Unable to open your photo library.');
    }
  };

  return (
    <Screen style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.heading}>Upload a Photo</Text>
      <TouchableOpacity onPress={() => setPickerVisible(true)} activeOpacity={0.7} style={styles.dropzone}>
        <Ionicons name="cloud-upload-outline" size={42} color={colors.primary} />
        <Text style={styles.dropzoneLabel}>Upload</Text>
      </TouchableOpacity>

      <Modal transparent visible={pickerVisible} animationType="fade" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Media Source</Text>
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Ionicons name="close" size={20} color={colors.subtleText} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                setPickerVisible(false);
                openCamera();
              }}
              style={styles.sheetAction}
            >
              <Ionicons name="camera-outline" size={22} color={colors.primary} />
              <Text style={styles.sheetActionText}>Take photo from camera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setPickerVisible(false);
                openLibrary();
              }}
              style={styles.sheetAction}
            >
              <Ionicons name="image-outline" size={22} color={colors.primary} />
              <Text style={styles.sheetActionText}>Choose from the gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 56
  },
  back: {
    color: colors.mutedAlt,
    fontSize: 16,
    marginBottom: 24
  },
  heading: {
    color: colors.subtleText,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24
  },
  dropzone: {
    height: 280,
    borderRadius: 28,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    gap: 12
  },
  dropzoneLabel: {
    color: colors.subtleText,
    fontWeight: '700'
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: colors.surface,
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: 18
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sheetTitle: {
    color: colors.subtleText,
    fontWeight: '700',
    fontSize: 18
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  sheetActionText: {
    color: colors.subtleText,
    fontSize: 16
  }
});
