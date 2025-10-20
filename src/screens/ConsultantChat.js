// src/screens/ConsultantChatScreen.js
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
import { Screen, colors, Toast } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ConsultantChatScreen({ navigation, route }) {
  const consultantName = route?.params?.consultantName || 'Consultant';
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'consultant',
      text: `Hi! I'm ${consultantName}, your interior design consultant. How can I help you today?`,
    },
  ]);
  const [toast, setToast] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now().toString(), sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
  };

  const openImagePicker = async (type) => {
    setModalVisible(false);
    let result;
    if (type === 'camera') {
      result = await ImagePicker.launchCameraAsync({ quality: 1 });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    }
    if (!result.canceled) {
      setToast(true);
      setTimeout(() => setToast(false), 1500);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.consultantBubble,
      ]}
    >
      {item.sender === 'consultant' && (
        <Ionicons name="person-circle-outline" size={46} color={colors.primary} style={styles.avatar} />
      )}
      <Text
        style={[
          styles.messageText,
          item.sender === 'user' ? styles.userText : styles.consultantText,
        ]}
      >
        {item.text}
      </Text>
      {item.sender === 'user' && (
        <Ionicons name="person-circle-outline" size={46} color="#0F3E48" style={styles.avatarUser} />
      )}
    </View>
  );

  return (
    <Screen inset={false} style={styles.screen}>
      <Toast
        visible={toast}
        text="Image uploaded successfully!"
        onClose={() => setToast(false)}
      />

      {/* HEADER */}
      <SafeAreaView style={styles.heroSection}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#FFFFFF" />
            <Text style={styles.consultantSubName}>{consultantName}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* MESSAGES */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      />

      {/* INPUT BAR */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.composer}
      >
        <View style={styles.inputWrapper}>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.uploadButton}>
            <Ionicons name="attach-outline" size={22} color="#0F3E48" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor="#7B8C8C"
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity onPress={handleSend}>
            <Ionicons name="arrow-forward-circle" size={30} color="#0F3E48" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* IMAGE UPLOAD MODAL */}
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

            <Text style={styles.modalTitle}>Send Image to Consultant</Text>

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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  consultantSubName: {
    fontSize: 17,
    color: '#FFFFFF',
    marginTop: 40,
    marginLeft: 5,
    fontFamily: 'serif',
  },
  messageBubble: {
    marginTop: 20,
    maxWidth: '100%',
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  consultantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#E6E6E6',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#CDE8E5',
  },
  messageText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'serif',
    flexShrink: 1,
  },
  consultantText: {
    color: '#0F3E48',
  },
  userText: {
    color: '#000',
  },
  avatar: {
    marginRight: 8,
  },
  avatarUser: {
    margin: 10,
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
    borderRadius: 10,
    borderWidth: 1.3,
    borderColor: '#0F3E48',
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    color: '#0F3E48',
    fontSize: 14,
    paddingVertical: 8,
  },
  uploadButton: {
    paddingRight: 10,
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
