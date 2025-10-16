import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, Button, Toast, colors } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';

export default function AiResultScreen({ navigation }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  return (
    <Screen inset={false} style={styles.screen}>
      <Toast visible={saved} text="Design saved successfully!" onClose={() => setSaved(false)} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} activeOpacity={0.6}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>AI Design Assistant</Text>
      </View>

      <View style={styles.chatBubble}>
        <Text style={styles.chatText}>Hi! How can I help you with your room design today?</Text>
      </View>
      <View style={styles.chatBubble}>
        <Text style={styles.chatText}>This is the color palette design my living room</Text>
      </View>

      <View style={styles.secondaryActions}>
        <Button
          title="Saved Design"
          onPress={() => setSaved(true)}
          variant="outline"
          style={styles.secondaryButton}
        />
        <Button
          title="Customize"
          onPress={() => navigation.navigate('CustomizeAI')}
          variant="outline"
          style={styles.secondaryButton}
        />
      </View>

      <View style={styles.composer}>
        <TouchableOpacity style={styles.uploadButton}>
          <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Ask AI to design your room......"
            placeholderTextColor={colors.mutedAlt}
            value={text}
            onChangeText={setText}
            style={styles.input}
          />
          <TouchableOpacity>
            <Ionicons name="arrow-forward-circle" size={32} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56
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
  chatBubble: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    alignSelf: 'flex-start'
  },
  chatText: {
    color: colors.subtleText
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 28
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: colors.primary
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
    marginRight: 12
  }
});
