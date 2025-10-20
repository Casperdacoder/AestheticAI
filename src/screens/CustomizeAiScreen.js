import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Platform,
  Linking,
  ScrollView,
  ActionSheetIOS
} from 'react-native';
import { Screen, Button, Toast, colors, Card } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { generateLayoutSuggestions } from '../services/ai';

const DEFAULT_IMAGE = 'https://picsum.photos/seed/kitchen/800/600';
const BULLET = '\u2022';
const STYLE_PRESETS = [
  {
    id: 'modern-minimalist',
    label: 'Modern Minimalist',
    prompt: 'a modern minimalist aesthetic with clean lines, low profiles, and hidden storage',
    description: 'Crisp silhouettes, restrained palette, clever storage'
  },
  {
    id: 'scandinavian-cozy',
    label: 'Scandinavian Cozy',
    prompt: 'a Scandinavian-inspired cozy vibe with light woods, layered textiles, and warm lighting',
    description: 'Soft textures, natural materials, warm lighting'
  },
  {
    id: 'industrial-loft',
    label: 'Industrial Loft',
    prompt: 'an industrial loft character with contrasting metals, raw textures, and statement lighting',
    description: 'Raw finishes, metal accents, bold lighting'
  },
  {
    id: 'futuristic-gamer',
    label: 'Futuristic Gamer',
    prompt: 'a futuristic gaming studio with ergonomic layouts, layered RGB lighting, and cable management',
    description: 'Ergonomics, RGB layers, tech storage'
  },
  {
    id: 'organic-boho',
    label: 'Organic Boho',
    prompt: 'an organic bohemian lounge with collected textiles, greenery, and sculptural accents',
    description: 'Layered textiles, greenery, collected decor'
  },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function CustomizeAiScreen({ navigation, route }) {
  const initialPrompt = route?.params?.quickPrompt ?? '';
  const [prompt, setPrompt] = useState(initialPrompt);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const [imageUri, setImageUri] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [busyMessage, setBusyMessage] = useState('');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);
  const [stylePreset, setStylePreset] = useState(STYLE_PRESETS[0]);
  const activeRoomAnalysis = result?.photoInsights?.roomAnalysis || null;
  const hasPhotoInsights =
    !!activeRoomAnalysis || (result?.photoInsights?.observations?.length ?? 0) > 0;
  const formatConfidence = (value) =>
    typeof value === 'number' && Number.isFinite(value) ? value.toFixed(2) : null;

  const previewSource = useMemo(() => ({ uri: imageUri || DEFAULT_IMAGE }), [imageUri]);
  const builderPrompt = useMemo(() => {
    if (!stylePreset) {
      return '';
    }
    return `Design a ${stylePreset.prompt}.`;
  }, [stylePreset]);
  const triggerToast = (setter) => {
    setter(true);
    setTimeout(() => setter(false), 1600);
  };

  const closeBusy = useCallback(() => setBusyMessage(''), []);

  const handleResult = useCallback(
    async (pickerResult) => {
      if (!pickerResult || pickerResult.canceled || !pickerResult.assets?.length) {
        return;
      }

      const asset = pickerResult.assets[0];
      const uri = asset.uri;

      setBusyMessage('Scanning photo...');
      setImageUri(uri);
      setResult(null);
      setImageData(null);
      setInfoMessage('');
      setErrorMessage('');

      try {
        const base64 =
          asset.base64 ??
          (await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 }));
        setImageData({
          uri,
          base64,
          mimeType: asset.mimeType || asset.type || 'image/jpeg',
          width: asset.width,
          height: asset.height
        });
        await wait(450);
        setInfoMessage('Photo scanned! Describe what you want to change.');
        requestAnimationFrame(() => inputRef.current?.focus());
      } catch (error) {
        console.warn('Failed to prepare image for analysis', error);
        setErrorMessage('We could not read the photo data. Try another image.');
      } finally {
        closeBusy();
      }
    },
    [closeBusy]
  );
  const ensureLibraryPermission = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const granted =
      permission.status === 'granted' ||
      permission.granted === true ||
      permission.accessPrivileges === 'limited';
    if (!granted) {
      setErrorMessage('We need access to your photos. Please enable it in Settings.');
      if (permission.canAskAgain === false) {
        Linking.openSettings();
      }
    }
    return granted;
  };

  const ensureCameraPermission = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    const granted = permission.status === 'granted' || permission.granted === true;
    if (!granted) {
      setErrorMessage('Camera access is required. Please enable it in Settings.');
      if (permission.canAskAgain === false) {
        Linking.openSettings();
      }
    }
    return granted;
  };

  const openLibrary = async () => {
    setSheetVisible(false);
    try {
      const granted = await ensureLibraryPermission();
      if (!granted) return;
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.9,
        base64: true,
        exif: true
      });
      await handleResult(pickerResult);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to open gallery.');
    }
  };

  const openCamera = async () => {
    setSheetVisible(false);
    if (Platform.OS === 'web') {
      setErrorMessage('Camera capture is not supported on web. Please upload from gallery.');
      return;
    }
    try {
      const granted = await ensureCameraPermission();
      if (!granted) return;
      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.9,
        base64: true,
        exif: true
      });
      await handleResult(pickerResult);
    } catch (error) {
      setErrorMessage(error.message || 'Unable to open camera.');
    }
  };

  const showPickerOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            openCamera();
          } else if (buttonIndex === 2) {
            openLibrary();
          }
        }
      );
    } else {
      setSheetVisible(true);
    }
  };

  const handleGenerate = async () => {
    const activePrompt = (prompt || route?.params?.quickPrompt || '').trim();
    if (!imageUri) {
      setErrorMessage('Upload or capture a photo first.');
      return;
    }
    if (!activePrompt) {
      setErrorMessage('Please describe the changes you want.');
      return;
    }


    let base64Data = imageData?.base64;
    let currentImageData = imageData;

    if (!base64Data && imageUri) {
      try {
        const reread = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64
        });
        base64Data = reread;
        currentImageData = {
          ...(imageData || {}),
          base64: reread
        };
        setImageData(currentImageData);
      } catch (readError) {
        console.warn('Failed to re-read photo data before regeneration', readError);
        setErrorMessage('We could not prepare the photo for a new design. Please upload again.');
        return;
      }
    }

    if (!base64Data) {
      setErrorMessage('We could not read the photo data. Please upload again.');
      return;
    }

    try {
      setBusyMessage(result ? 'Generating another variation...' : 'Generating your custom design...');
      const response = await generateLayoutSuggestions({
        imageUri,
        prompt: activePrompt,
        imageBase64: base64Data,
        metadata: {
          mimeType: currentImageData?.mimeType,
          width: currentImageData?.width,
          height: currentImageData?.height
        },
        requestId: Date.now()
      });
      setResult(response);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
      setPrompt(activePrompt);
      triggerToast(setApplied);
      setInfoMessage('Your custom layout is ready!');
    } catch (error) {
      setErrorMessage(error.message || 'Something went wrong generating the layout.');
    } finally {
      closeBusy();
    }
  };

  const handleSaveDesign = () => {
    if (!result) {
      setErrorMessage('Generate a design before saving.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
    navigation.navigate('Projects', { savedDesign: result });
  };

  return (
    <Screen inset={false} style={styles.screen}>
      {applied ? (
        <Toast visible text="Applied successfully!" onClose={() => setApplied(false)} variant="success" />
      ) : null}
      {saved ? (
        <Toast visible text="Design saved successfully!" onClose={() => setSaved(false)} variant="success" />
      ) : null}
      {infoMessage ? (
        <Toast visible text={infoMessage} onClose={() => setInfoMessage('')} variant="info" />
      ) : null}
      {errorMessage ? (
        <Toast visible text={errorMessage} onClose={() => setErrorMessage('')} variant="warning" />
      ) : null}

      <ScrollView
        ref={scrollRef}
        style={styles.scroller}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack?.()} activeOpacity={0.6}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Customize with AI</Text>
        </View>

        <Image source={previewSource} style={styles.preview} />

        <View style={styles.promptBubble}>
          <Text style={styles.promptText}>
            {imageUri ? 'Photo ready! Use the builder below or add extra notes.' : 'Great choice! Which do you want to change?'}
          </Text>
        </View>

        <Card style={styles.builderCard}>
          <Text style={styles.builderTitle}>Prompt Builder</Text>
          <Text style={styles.builderHint}>Choose a style to auto-build the prompt.</Text>
          <Text style={styles.builderSubheading}>Style Preset</Text>
          <View style={styles.chipRow}>
            {STYLE_PRESETS.map((preset) => {
              const isActive = stylePreset?.id === preset.id;
              return (
                <TouchableOpacity
                  key={preset.id}
                  style={[styles.chip, isActive && styles.chipActive]}
                  onPress={() => setStylePreset(preset)}
                >
                  <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{preset.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {stylePreset?.description ? (
            <Text style={styles.builderDescription}>{stylePreset.description}</Text>
          ) : null}
          {builderPrompt ? (
            <View style={styles.builderSummaryBox}>
              <Text style={styles.builderSummaryTitle}>Generated Brief</Text>
              <Text style={styles.builderSummaryText}>{builderPrompt}</Text>
            </View>
          ) : (
            <Text style={styles.builderHintSmall}>Pick a style preset to auto-build the prompt.</Text>
          )}
        </Card>

        {result ? (
          <Card style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultStyle}>{result.style.name}</Text>
              <Text style={styles.resultDescription}>{result.style.description}</Text>
            </View>
            <View style={styles.section}>
              <View style={styles.paletteRow}>
                {result.palette.map((hex) => (
                  <View key={hex} style={[styles.paletteSwatch, { backgroundColor: hex }]} />
                ))}
              </View>
            </View>
            {hasPhotoInsights ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Photo Insights</Text>
                {activeRoomAnalysis ? (
                  <>
                    <Text style={styles.tipItem}>
                      {`${BULLET} Detected room: ${activeRoomAnalysis.roomType || 'Undetermined'}${
                        formatConfidence(activeRoomAnalysis.roomConfidence)
                          ? ` (confidence ${formatConfidence(activeRoomAnalysis.roomConfidence)})`
                          : ''
                      }`}
                    </Text>
                    {activeRoomAnalysis.hasWindow ? (
                      <Text style={styles.tipItem}>
                        {`${BULLET} Window detected${
                          formatConfidence(activeRoomAnalysis.windowConfidence)
                            ? ` (confidence ${formatConfidence(activeRoomAnalysis.windowConfidence)})`
                            : ''
                        }.`}
                      </Text>
                    ) : null}
                  </>
                ) : null}
                {Array.isArray(result.photoInsights?.observations)
                  ? result.photoInsights.observations.map((note) => (
                      <Text key={note} style={styles.tipItem}>{`${BULLET} ${note}`}</Text>
                    ))
                  : null}
              </View>
            ) : null}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Layout Suggestions</Text>
              {result.layoutIdeas.map((idea, index) => (
                <View key={`${idea.room}-${index}`} style={styles.ideaItem}>
                  <Text style={styles.ideaRoom}>{idea.room}</Text>
                  <Text style={styles.ideaSummary}>{idea.summary}</Text>
                </View>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Style-Based Decor Tips</Text>
              {result.decorTips.map((tip) => (
                <Text key={tip} style={styles.tipItem}>{`${BULLET} ${tip}`}</Text>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Furniture Matches</Text>
              {result.furnitureMatches.map((item) => (
                <Text key={item} style={styles.tipItem}>{`${BULLET} ${item}`}</Text>
              ))}
            </View>
          </Card>
        ) : null}

        <View style={styles.secondaryActions}>
          <Button
            title="Apply Changes"
            onPress={handleGenerate}
            variant="outline"
            style={styles.secondaryButton}
          />
          <Button
            title="Saved Design"
            onPress={handleSaveDesign}
            variant="outline"
            style={styles.secondaryButton}
          />
        </View>
      </ScrollView>

      <View style={styles.composer}>
        <TouchableOpacity style={styles.uploadButton} onPress={showPickerOptions}>
          <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            placeholder="Additional notes (optional)"
            placeholderTextColor={colors.mutedAlt}
            value={prompt}
            onChangeText={setPrompt}
            style={styles.input}
            editable={!busyMessage}
            autoCorrect
            multiline
            blurOnSubmit={false}
            onFocus={() => setSheetVisible(false)}
          />
          <TouchableOpacity onPress={handleGenerate} disabled={!!busyMessage}>
            <Ionicons name="arrow-forward-circle" size={32} color={busyMessage ? colors.mutedAlt : colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal transparent visible={!!busyMessage} animationType="fade">
        <View style={styles.busyOverlay}>
          <View style={styles.busyCard}>
            <ActivityIndicator size="large" color={colors.primaryText} />
            <Text style={styles.busyText}>{busyMessage}</Text>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={sheetVisible} animationType="fade" onRequestClose={() => setSheetVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setSheetVisible(false)}>
          <View style={styles.sheetOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>Select Media Source</Text>
                  <TouchableOpacity onPress={() => setSheetVisible(false)}>
                    <Ionicons name="close" size={20} color={colors.subtleText} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={openCamera} style={styles.sheetAction}>
                  <Ionicons name="camera-outline" size={22} color={colors.primary} />
                  <Text style={styles.sheetActionText}>Take photo from camera</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openLibrary} style={styles.sheetAction}>
                  <Ionicons name="image-outline" size={22} color={colors.primary} />
                  <Text style={styles.sheetActionText}>Choose from the gallery</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    backgroundColor: colors.background
  },
  scroller: {
    flex: 1
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 220
  },
  header: {
    marginBottom: 16
  },
  back: {
    color: colors.mutedAlt,
    marginBottom: 12
  },
  title: {
    color: colors.subtleText,
    fontSize: 24,
    fontWeight: '700'
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.outline
  },
  promptBubble: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 18,
    marginTop: 20,
    alignSelf: 'flex-start'
  },
  promptText: {
    color: colors.subtleText
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    gap: 16,
    marginBottom: 24
  },
  secondaryButton: {
    flex: 1,
    borderColor: colors.primary,
    borderWidth: 1.5,
    paddingVertical: 10
  },
  composer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  uploadButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 18,
    backgroundColor: colors.surface
  },
  input: {
    flex: 1,
    color: colors.primaryText,
    marginRight: 12,
    minHeight: 40,
    textAlignVertical: 'top'
  },
  busyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  busyCard: {
    backgroundColor: colors.surface,
    paddingVertical: 28,
    paddingHorizontal: 32,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.outline
  },
  busyText: {
    color: colors.subtleText,
    fontWeight: '600'
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: colors.surface,
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    gap: 18,
    borderWidth: 1,
    borderColor: colors.outline
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
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
  },
  builderCard: {
    marginTop: 20,
    padding: 20,
    gap: 16,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.outline
  },
  builderTitle: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: '700'
  },
  builderHint: {
    color: colors.mutedAlt,
    fontSize: 13,
    lineHeight: 18
  },
  builderHintSmall: {
    color: colors.mutedAlt,
    fontSize: 12,
    marginTop: 4
  },
  builderSubheading: {
    color: colors.subtleText,
    fontWeight: '700',
    marginTop: 12
  },
  builderDescription: {
    color: colors.mutedAlt,
    fontSize: 13,
    marginTop: 8
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surface
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  chipLabel: {
    color: colors.subtleText,
    fontWeight: '600',
    fontSize: 13
  },
  chipLabelActive: {
    color: colors.primaryText
  },
  builderSummaryBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.outline
  },
  builderSummaryTitle: {
    color: colors.subtleText,
    fontWeight: '700',
    marginBottom: 6
  },
  builderSummaryText: {
    color: colors.subtleText,
    lineHeight: 18
  },
  resultCard: {
    marginTop: 28,
    gap: 18
  },
  resultHeader: {
    gap: 6
  },
  resultStyle: {
    color: colors.primaryText,
    fontSize: 20,
    fontWeight: '700'
  },
  resultDescription: {
    color: colors.subtleText
  },
  section: {
    gap: 10
  },
  sectionTitle: {
    color: colors.subtleText,
    fontWeight: '700',
    fontSize: 16
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 10
  },
  paletteSwatch: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outline
  },
  ideaItem: {
    gap: 4
  },
  ideaRoom: {
    color: colors.primaryText,
    fontWeight: '600'
  },
  ideaSummary: {
    color: colors.subtleText,
    lineHeight: 20
  },
  tipItem: {
    color: colors.subtleText,
    lineHeight: 20
  }
});













