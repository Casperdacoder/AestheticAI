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
  SafeAreaView,
} from 'react-native';
import { Screen, Toast, colors } from '../components/UI';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function AssistantScreen({ navigation }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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
        text: 'Got it! I’ll start analyzing your design preferences.',
      };
      setMessages(prev => [...prev, aiMessage]);
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
    if (!result.canceled) setSaved(true);
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
