import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Screen, Toast, colors } from '../components/UI';

const INITIAL_MESSAGES = [
  { id: '1', type: 'ai', text: "Here's your current design." },
  { id: '2', type: 'ai', text: 'What would you like to customize?' }
];

export default function CustomizeWithAI({ navigation }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
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
        text: 'Your updates are on the way. AestheticAI is processing your request.'
      };
      setMessages((prev) => [...prev, aiMessage]);
      replyTimeoutRef.current = null;
    }, 800);
  };

  const saveDesign = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
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
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageText}>Current Design Preview</Text>
            </View>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  heroSection: {
    backgroundColor: '#0F3E48',
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 24
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    maxWidth: 320,
    borderRadius: 16,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12
  },
  imageText: {
    color: '#0F3E48',
    fontWeight: '600',
    textAlign: 'center'
  },
  chatBubble: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '82%'
  },
  aiBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#E1E8E8'
  },
  userBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F3E48'
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
  secondaryActions: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 118,
    flexDirection: 'row',
    gap: 12
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: '#0F3E48',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  secondaryButtonText: {
    color: '#0F3E48',
    fontWeight: '600',
    fontSize: 13
  },
  composer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40
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
    gap: 10
  },
  input: {
    flex: 1,
    color: '#0F3E48',
    fontSize: 14,
    paddingVertical: 6
  },
  uploadIcon: {
    marginRight: 4
  }
});
