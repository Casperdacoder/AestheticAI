import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
<<<<<<< HEAD
  Platform,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Screen, Toast, colors } from '../components/UI';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const INITIAL_MESSAGES = [
  { id: '1', type: 'ai', text: "Here's your current design preview." },
  { id: '2', type: 'ai', text: 'What would you like to customize?' },
=======
  Platform
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Screen, Toast, colors } from '../components/UI';

const INITIAL_MESSAGES = [
  { id: '1', type: 'ai', text: "Here's your current design." },
  { id: '2', type: 'ai', text: 'What would you like to customize?' }
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
];

export default function CustomizeWithAI({ navigation }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
<<<<<<< HEAD
  const [previewUri, setPreviewUri] = useState(null);
  const [hasAiResult, setHasAiResult] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftUri, setDraftUri] = useState(null);
  const [processingEdit, setProcessingEdit] = useState(false);
  const replyTimeoutRef = useRef(null);
  const originalPreviewRef = useRef(null);
=======
  const replyTimeoutRef = useRef(null);
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        clearTimeout(replyTimeoutRef.current);
      }
    };
  }, []);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const userMessage = { id: Date.now().toString(), type: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setText('');

    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current);
    }

    replyTimeoutRef.current = setTimeout(() => {
      const aiMessage = {
        id: `${Date.now()}-ai`,
        type: 'ai',
<<<<<<< HEAD
        text: 'Great! I am applying those changes and will show you the updated concept shortly.',
      };
      setMessages((prev) => [...prev, aiMessage]);
      setHasAiResult(true);
=======
        text: 'Your updates are on the way. AestheticAI is processing your request.'
      };
      setMessages((prev) => [...prev, aiMessage]);
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
      replyTimeoutRef.current = null;
    }, 800);
  };

  const saveDesign = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const handlePickPreview = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const handleStartEditing = () => {
    if (!previewUri) {
      return;
    }
    originalPreviewRef.current = previewUri;
    setDraftUri(previewUri);
    setEditing(true);
  };

  const applyEdit = async (operations) => {
    if (!draftUri) {
      return;
    }
    setProcessingEdit(true);
    try {
      const result = await ImageManipulator.manipulateAsync(
        draftUri,
        operations,
        { compress: 0.96, format: ImageManipulator.SaveFormat.PNG }
      );
      setDraftUri(result.uri);
    } catch (err) {
      console.warn('Image edit failed', err?.message);
    } finally {
      setProcessingEdit(false);
    }
  };

  const handleResetDraft = () => {
    if (originalPreviewRef.current) {
      setDraftUri(originalPreviewRef.current);
    }
  };

  const handleCancelEditing = () => {
    setDraftUri(null);
    setEditing(false);
  };

  const handleSaveEditing = () => {
    if (draftUri) {
      setPreviewUri(draftUri);
    }
    setDraftUri(null);
    setEditing(false);
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.chatBubble,
        item.type === 'user' ? styles.userBubble : styles.aiBubble
      ]}
    >
      <Text
        style={[
          styles.chatText,
          item.type === 'user' ? styles.userText : styles.aiText
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  const canEdit = hasAiResult && !!previewUri;

  return (
    <Screen inset={false} style={styles.screen}>
      <Toast visible={saved} text="Design saved successfully!" onClose={() => setSaved(false)} />

      <View style={styles.heroSection}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Customize with AI</Text>
        <Text style={styles.heroSubtitle}>Refine AI ideas and tweak the visual concept instantly.</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.imageContainer}>
<<<<<<< HEAD
            {previewUri ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={canEdit ? handleStartEditing : undefined}
                style={styles.previewWrapper}
              >
                <Image source={{ uri: previewUri }} style={styles.previewImage} />
                <View style={[styles.editBadge, !canEdit && styles.editBadgeDisabled]}>
                  <Ionicons name="create-outline" size={16} color={canEdit ? '#0F3E48' : colors.muted} />
                  <Text style={[styles.editBadgeText, !canEdit && styles.editBadgeTextDisabled]}>
                    {canEdit ? 'Tap to edit preview' : 'Waiting for AI update'}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickPreview} activeOpacity={0.85}>
                <Ionicons name="image-outline" size={28} color="#0F3E48" />
                <Text style={styles.imageText}>Current Design Preview</Text>
                <Text style={styles.imageHint}>Upload the AI render you'd like to adjust.</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.replaceButton} onPress={handlePickPreview} activeOpacity={0.8}>
              <Ionicons name="cloud-upload-outline" size={18} color="#0F3E48" />
              <Text style={styles.replaceButtonText}>{previewUri ? 'Replace preview image' : 'Upload preview image'}</Text>
            </TouchableOpacity>
=======
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageText}>Current Design Preview</Text>
            </View>
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
          </View>
        }
      />

      <View style={styles.secondaryActions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={send}>
          <Text style={styles.secondaryButtonText}>Apply Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={saveDesign}>
          <Text style={styles.secondaryButtonText}>Save Design</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.secondaryButton, styles.secondaryButtonFull, !canEdit && styles.secondaryButtonDisabled]}
          onPress={handleStartEditing}
          disabled={!canEdit}
        >
          <Text style={styles.secondaryButtonText}>Edit AI Preview</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.composer}
      >
        <View style={styles.inputWrapper}>
          <FontAwesome5 name="upload" size={18} color="#0F3E48" style={styles.uploadIcon} />
          <TextInput
            placeholder="Describe what you want to change..."
            placeholderTextColor="#7B8C8C"
            value={text}
            onChangeText={setText}
            style={styles.input}
          />
          <TouchableOpacity onPress={send} activeOpacity={0.8}>
            <Ionicons name="arrow-forward-circle-outline" size={30} color="#0F3E48" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal transparent animationType="fade" visible={editing} onRequestClose={handleCancelEditing}>
        <View style={styles.editModalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>Adjust Preview</Text>
              <TouchableOpacity onPress={handleCancelEditing}>
                <Ionicons name="close" size={20} color={colors.muted} />
              </TouchableOpacity>
            </View>

            {draftUri ? (
              <Image source={{ uri: draftUri }} style={styles.editImage} resizeMode="contain" />
            ) : null}

            {processingEdit ? (
              <View style={styles.editLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.editLoadingText}>Applying adjustment…</Text>
              </View>
            ) : null}

            <View style={styles.editActionsRow}>
              <TouchableOpacity style={styles.editAction} onPress={() => applyEdit([{ rotate: -90 }])}>
                <Ionicons name="refresh-circle" size={22} color="#0F3E48" />
                <Text style={styles.editActionLabel}>Rotate Left</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editAction} onPress={() => applyEdit([{ rotate: 90 }])}>
                <Ionicons name="refresh-circle" size={22} color="#0F3E48" style={{ transform: [{ scaleX: -1 }] }} />
                <Text style={styles.editActionLabel}>Rotate Right</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editAction}
                onPress={() => applyEdit([{ flip: ImageManipulator.FlipType.Horizontal }])}
              >
                <Ionicons name="swap-horizontal" size={22} color="#0F3E48" />
                <Text style={styles.editActionLabel}>Flip</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.editFooter}>
              <TouchableOpacity style={styles.resetButton} onPress={handleResetDraft}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <View style={styles.editFooterActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEditing}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEditing}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: colors.background,
=======
    backgroundColor: colors.background
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  },
  heroSection: {
    backgroundColor: '#0F3E48',
    paddingTop: 56,
    paddingBottom: 28,
<<<<<<< HEAD
    paddingHorizontal: 24,
=======
    paddingHorizontal: 24
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
<<<<<<< HEAD
    alignItems: 'center',
=======
    alignItems: 'center'
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
<<<<<<< HEAD
    marginTop: 18,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 180,
    paddingTop: 20,
    gap: 12,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
=======
    marginTop: 18
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 140,
    paddingTop: 20,
    gap: 12
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
<<<<<<< HEAD
    maxWidth: 340,
    borderRadius: 18,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 10,
=======
    maxWidth: 320,
    borderRadius: 16,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  },
  imageText: {
    color: '#0F3E48',
    fontWeight: '600',
<<<<<<< HEAD
    textAlign: 'center',
  },
  imageHint: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
  },
  replaceButton: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0F3E48',
    backgroundColor: colors.solid,
  },
  replaceButtonText: {
    color: '#0F3E48',
    fontWeight: '600',
    fontSize: 13,
  },
  previewWrapper: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: colors.solid,
  },
  editBadgeDisabled: {
    backgroundColor: '#E4E8E8',
  },
  editBadgeText: {
    color: '#0F3E48',
    fontWeight: '600',
    fontSize: 13,
  },
  editBadgeTextDisabled: {
    color: colors.muted,
  },
=======
    textAlign: 'center'
  },
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  chatBubble: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
<<<<<<< HEAD
    maxWidth: '82%',
  },
  aiBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#E1E8E8',
  },
  userBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F3E48',
=======
    maxWidth: '82%'
  },
  aiBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#E1E8E8'
  },
  userBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F3E48'
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20
  },
  aiText: {
    color: '#0F3E48'
  },
  userText: {
    color: '#FFFFFF'
  },
<<<<<<< HEAD
  aiText: {
    color: '#0F3E48',
  },
  userText: {
    color: '#FFFFFF',
  },
=======
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  secondaryActions: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 118,
    flexDirection: 'row',
<<<<<<< HEAD
    gap: 12,
    flexWrap: 'wrap',
=======
    gap: 12
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: '#0F3E48',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
<<<<<<< HEAD
    backgroundColor: colors.solid,
  },
  secondaryButtonFull: {
    flexBasis: '100%',
  },
  secondaryButtonDisabled: {
    opacity: 0.4,
=======
    backgroundColor: '#FFFFFF'
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  },
  secondaryButtonText: {
    color: '#0F3E48',
    fontWeight: '600',
<<<<<<< HEAD
    fontSize: 13,
=======
    fontSize: 13
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  },
  composer: {
    position: 'absolute',
    left: 20,
    right: 20,
<<<<<<< HEAD
    bottom: 40,
=======
    bottom: 40
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#0F3E48',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.solid,
<<<<<<< HEAD
    gap: 10,
  },
  uploadIcon: {
    marginRight: 4,
=======
    gap: 10
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  },
  input: {
    flex: 1,
    color: '#0F3E48',
    fontSize: 14,
<<<<<<< HEAD
    paddingVertical: 6,
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  editModal: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.solid,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  editHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryText,
  },
  editImage: {
    width: '100%',
    height: 200,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
  },
  editLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editLoadingText: {
    fontSize: 13,
    color: colors.muted,
  },
  editActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  editAction: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0F3E48',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 6,
  },
  editActionLabel: {
    fontSize: 13,
    color: '#0F3E48',
    fontWeight: '600',
  },
  editFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  resetButtonText: {
    color: colors.muted,
    fontWeight: '600',
  },
  editFooterActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
  },
  cancelButtonText: {
    color: colors.primaryText,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.primaryText,
    fontWeight: '700',
=======
    paddingVertical: 6
>>>>>>> cc2b433a93313fe45b4a004dac2a8786ca935cf3
  },
  uploadIcon: {
    marginRight: 4
  }
});
