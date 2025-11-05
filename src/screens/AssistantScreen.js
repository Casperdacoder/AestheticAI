import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Screen, Toast, colors } from '../components/UI';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { generateLayout } from '../services/api';
import {
  ensureCameraPermission,
  ensureMediaLibraryPermission,
  MEDIA_TYPE_IMAGES,
} from '../utils/imagePickerHelpers';

export default function AssistantScreen({ navigation }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', type: 'ai', text: 'Welcome! Ready to design your space with AestheticAI' },
    { id: '2', type: 'ai', text: 'Please provide your room details to start' },
  ]);

  const send = () => {
    if (!text.trim()) return;
    const userMessage = { id: Date.now().toString(), type: 'user', text: text.trim() };
    setMessages(prev => [...prev, userMessage]);
    setText('');

    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: 'Got it! I’ll keep that in mind when you share a photo.',
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 600);
  };

  const saveDesign = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const formatDesignResponse = (result) => {
    if (!result) {
      return 'I could not generate a design suggestion right now.';
    }

    const sections = [];

    if (result.caption) {
      sections.push(`Vision summary: ${result.caption}`);
    }

    if (result.warning) {
      sections.push(`Note: ${result.warning}`);
    }

    if (result.plan) {
      const {
        styleName,
        styleSummary,
        colorPalette,
        layoutIdeas,
        decorTips,
        furnitureSuggestions,
        photoInsights,
      } = result.plan;

      if (styleName || styleSummary) {
        sections.push(
          ['Style:', [styleName, styleSummary].filter(Boolean).join(' — ')].filter(Boolean).join(' ')
        );
      }

      if (Array.isArray(colorPalette) && colorPalette.length) {
        sections.push(`Palette: ${colorPalette.join(', ')}`);
      }

      if (Array.isArray(layoutIdeas) && layoutIdeas.length) {
        sections.push(
          `Layout ideas:\n${layoutIdeas
            .map((idea) => `- ${idea.room ? `${idea.room}: ` : ''}${idea.summary}`)
            .join('\n')}`
        );
      }

      if (Array.isArray(decorTips) && decorTips.length) {
        sections.push(`Decor tips:\n${decorTips.map((tip) => `- ${tip}`).join('\n')}`);
      }

      if (Array.isArray(furnitureSuggestions) && furnitureSuggestions.length) {
        sections.push(`Furniture suggestions:\n${furnitureSuggestions.map((item) => `- ${item}`).join('\n')}`);
      }

      if (photoInsights?.observations?.length || photoInsights?.recommendedLighting) {
        const insights = [];
        if (Array.isArray(photoInsights?.observations) && photoInsights.observations.length) {
          insights.push(...photoInsights.observations.map((item) => `- ${item}`));
        }
        if (photoInsights?.recommendedLighting) {
          insights.push(`Recommended lighting: ${photoInsights.recommendedLighting}`);
        }
        sections.push(`Photo insights:\n${insights.join('\n')}`);
      }
    } else if (result.raw) {
      sections.push(result.raw);
    }

    return sections.length ? sections.join('\n\n') : 'I could not parse the design suggestion.';
  };

  const getLatestUserPrompt = () => {
    if (text.trim()) {
      return text.trim();
    }
    const lastUser = [...messages].reverse().find((message) => message.type === 'user');
    return lastUser?.text?.trim?.() || '';
  };

  const requestDesignFromImage = async (uri) => {
    if (!uri) {
      return;
    }

    setLoading(true);
    const promptText =
      getLatestUserPrompt() ||
      'Generate an interior style, layout, decor tips, and furniture suggestions based on this photo.';

    try {
      const result = await generateLayout({
        imageUri: uri,
        prompt: promptText,
      });

      const formatted = formatDesignResponse(result);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-ai`,
          type: 'ai',
          text: formatted,
        },
      ]);
    } catch (error) {
      console.warn('generateLayout error', error);
      Alert.alert(
        'Design suggestion unavailable',
        error?.message || 'We could not generate a suggestion for this photo. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openImagePicker = async (type) => {
    setModalVisible(false);
    let result;
    if (type === 'camera') {
      const { granted } = await ensureCameraPermission();
      if (!granted) return;
      try {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: MEDIA_TYPE_IMAGES,
          quality: 1,
        });
      } catch (error) {
        console.warn('ImagePicker camera error', error);
        Alert.alert('Camera error', error?.message ?? 'Unable to open the camera.');
        return;
      }
    } else {
      const { granted } = await ensureMediaLibraryPermission();
      if (!granted) return;
      try {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: MEDIA_TYPE_IMAGES,
          quality: 1,
        });
      } catch (error) {
        console.warn('ImagePicker library error', error);
        Alert.alert('Photo picker error', error?.message ?? 'Unable to open your photo library.');
        return;
      }
    }
    if (!result.canceled && result.assets?.length) {
      await requestDesignFromImage(result.assets[0].uri);
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
      <Toast
        visible={saved}
        text="Design saved successfully!"
        onClose={() => setSaved(false)}
      />

      {/* HERO SECTION */}
      <SafeAreaView style={styles.heroSection}>
        <TouchableOpacity
          onPress={() => navigation.navigate('UserTabs', { screen: 'Home' })}
          activeOpacity={0.6}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>AI Design Assistant</Text>
        
      </SafeAreaView>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? (
            <Text style={styles.loadingText}>
              Analyzing your photo and preparing a tailored design suggestion...
            </Text>
          ) : null
        }
      />

      {/* Buttons */}
      <View style={styles.secondaryActions}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={saveDesign}
        >
          <Text style={styles.secondaryButtonText}>Saved Design</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('CustomizeAI')}
        >
          <Text style={styles.secondaryButtonText}>Customize</Text>
        </TouchableOpacity>
      </View>

      {/* Input Field */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.composer}
      >
        <View style={styles.inputWrapper}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.uploadButton}>
            <FontAwesome5 name="upload" size={18} color="#0F3E48" />
          </TouchableOpacity>

          <TextInput
            placeholder="Ask AI to design your room..."
            placeholderTextColor="#7B8C8C"
            value={text}
            onChangeText={setText}
            style={styles.input}
          />

          <TouchableOpacity onPress={send}>
            <Ionicons name="arrow-forward-circle-outline" size={30} color="#0F3E48" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Upload Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color="#0F3E48" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Upload Room Photo</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => openImagePicker('camera')}
            >
              <Ionicons name="camera" size={18} color="#0F3E48" />
              <Text style={styles.modalButtonText}>Take a Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => openImagePicker('gallery')}
            >
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
    backgroundColor: '#FFFFFF',
  },

  heroSection: {
    backgroundColor: '#0F3E48',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 20 : 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    marginBottom: 10, 
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 6,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },

  aiBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#D9D9D9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F3E48',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    maxWidth: '80%',
  },
  chatText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'serif',
  },
  aiText: {
    color: '#0F3E48',
  },
  userText: {
    color: '#FFFFFF',
  },

  secondaryActions: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  secondaryButton: {
    width: 100,
    borderWidth: 1.3,
    borderColor: '#0F3E48',
    borderRadius: 20,
    paddingVertical: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0F3E48',
    fontWeight: '500',
    fontSize: 12,
  },

  composer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 50,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.3,
    borderColor: '#0F3E48',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  uploadButton: {
    paddingRight: 10,
  },
  input: {
    flex: 1,
    color: '#0F3E48',
    fontSize: 14,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#0F3E48',
    marginHorizontal: 24,
    marginTop: 12,
    fontStyle: 'italic',
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
