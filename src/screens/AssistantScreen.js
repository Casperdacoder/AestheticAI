import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Screen, Toast, colors } from '../components/UI';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const INITIAL_MESSAGES = [
  { id: '1', type: 'ai', text: 'Welcome! Ready to design your space with AestheticAI.' },
  { id: '2', type: 'ai', text: 'Share room details or upload a photo to begin.' },
];

export default function AssistantScreen({ navigation }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const replyTimeoutRef = useRef(null);

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
        text: 'Great! I am applying those changes and will show you the updated concept shortly.',
      };
      setMessages((prev) => [...prev, aiMessage]);
      replyTimeoutRef.current = null;
    }, 800);
  };

  const saveDesign = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const openImagePicker = async (type) => {
    setModalVisible(false);
    let result;
    if (type === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
    }

    if (!result.canceled) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-upload`,
          type: 'user',
          text: 'Uploaded a new room reference photo.',
        },
      ]);
      saveDesign();
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.chatBubble,
        item.type === 'user' ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text
        style={[
          styles.chatText,
          item.type === 'user' ? styles.userText : styles.aiText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <Screen inset={false} style={styles.screen}>
      <Toast visible={saved} text="Design saved successfully!" onClose={() => setSaved(false)} />

      <SafeAreaView style={styles.heroSection}>
        <TouchableOpacity
          onPress={() => navigation.navigate('UserTabs', { screen: 'Home' })}
          activeOpacity={0.7}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Design with AI</Text>
        <Text style={styles.heroSubtitle}>
          Upload a room photo or describe your vision. I'll craft layout ideas instantly.
        </Text>
      </SafeAreaView>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.imagePlaceholder}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="image-outline" size={32} color="#0F3E48" />
            <Text style={styles.imageText}>
              Tap to upload a room reference or capture a new photo.
            </Text>
            <Text style={styles.imageHint}>
              Visual context helps tailor budget-aware concepts.
            </Text>
          </TouchableOpacity>
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
          style={[styles.secondaryButton, styles.secondaryButtonFull]}
          onPress={() => navigation.navigate('CustomizeAI')}
        >
          <Text style={styles.secondaryButtonText}>Open Customizer</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.composer}
      >
        <View style={styles.inputWrapper}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.uploadButton}>
            <FontAwesome5 name="upload" size={18} color="#0F3E48" />
          </TouchableOpacity>

          <TextInput
            placeholder="Describe your dream layout, style, or constraints..."
            placeholderTextColor={colors.mutedAlt}
            value={text}
            onChangeText={setText}
            style={styles.input}
          />

          <TouchableOpacity onPress={send}>
            <Ionicons name="arrow-forward-circle-outline" size={30} color="#0F3E48" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Ionicons name="close" size={22} color="#0F3E48" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Upload Room Photo</Text>

            <TouchableOpacity style={styles.modalButton} onPress={() => openImagePicker('camera')}>
              <Ionicons name="camera" size={18} color="#0F3E48" />
              <Text style={styles.modalButtonText}>Take a Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={() => openImagePicker('gallery')}>
              <Ionicons name="image" size={18} color="#0F3E48" />
              <Text style={styles.modalButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroSection: {
    backgroundColor: '#0F3E48',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 36 : 56,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 18,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 8,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 160,
    gap: 12,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 18,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  imageText: {
    color: '#0F3E48',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },
  imageHint: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  chatBubble: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '82%',
  },
  aiBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#E1E8E8',
  },
  userBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F3E48',
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiText: {
    color: '#0F3E48',
  },
  userText: {
    color: '#FFFFFF',
  },
  secondaryActions: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 118,
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: '#0F3E48',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.solid,
  },
  secondaryButtonFull: {
    flexBasis: '100%',
  },
  secondaryButtonText: {
    color: '#0F3E48',
    fontWeight: '600',
    fontSize: 13,
  },
  composer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
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
    gap: 10,
  },
  uploadButton: {
    paddingRight: 4,
  },
  input: {
    flex: 1,
    color: '#0F3E48',
    fontSize: 14,
    paddingVertical: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F3E48',
    marginBottom: 20,
    marginTop: 10,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 6,
    backgroundColor: '#F5F5F5',
    width: '100%',
    justifyContent: 'center',
  },
  modalButtonText: {
    marginLeft: 8,
    color: '#0F3E48',
    fontSize: 15,
    fontWeight: '500',
  },
});
