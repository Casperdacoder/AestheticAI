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
} from 'react-native';
import { Screen, Toast, colors } from '../components/UI';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function CustomizeWithAI({ navigation }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', type: 'ai', text: 'Here’s your current design' },
    { id: '2', type: 'ai', text: 'What would you like to customize?' },
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
        text: 'Your changes are being processed by AestheticAI.',
      };
      setMessages(prev => [...prev, aiMessage]);
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
      <View style={styles.heroSection}>
        <TouchableOpacity
          onPress={() => navigation.navigate('UserTabs', { screen: 'Home' })}
          activeOpacity={0.6}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>Customize with AI</Text>
      </View>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.imageContainer}>
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageText}>[Current Design Image]</Text>
            </View>
          </View>
        }
      />

      {/* Buttons */}
      <View style={styles.secondaryActions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={send}>
          <Text style={styles.secondaryButtonText}>Apply Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={saveDesign}>
          <Text style={styles.secondaryButtonText}>Save Design</Text>
        </TouchableOpacity>
      </View>

      {/* Input Field */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.composer}
      >
        <View style={styles.inputWrapper}>
          <FontAwesome5 name="upload" size={18} color="#0F3E48" style={{ marginRight: 10 }} />
          <TextInput
            placeholder="Describe what you want to change...."
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  heroSection: {
    backgroundColor: '#0F3E48',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,

  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
  },

  imageContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  imagePlaceholder: {
    width: 250,
    height: 140,
    backgroundColor: '#D9D9D9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: '#0F3E48',
    fontWeight: '600',
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
  },
  aiText: { color: '#0F3E48' },
  userText: { color: '#FFFFFF' },

  secondaryActions: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    flexDirection: 'row',
  },
  secondaryButton: {
    borderWidth: 1.3,
    borderColor: '#0F3E48',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
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
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    color: '#0F3E48',
    fontSize: 14,
    paddingVertical: 8,
    
  },
});
