import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Screen, colors, Toast } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { listenToChatMessages, sendChatMessage } from '../services/chat';

export default function ChatScreen({ route, navigation }) {
  const { chatId, participantName = 'Conversation', consultationId = null } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState(null);
  const listRef = useRef(null);
  const currentUserId = auth.currentUser?.uid || null;

  useEffect(() => {
    if (!chatId) {
      return undefined;
    }

    const unsubscribe = listenToChatMessages(
      chatId,
      (items) => {
        setMessages(items);
        requestAnimationFrame(() => {
          if (listRef.current && items.length) {
            listRef.current.scrollToEnd({ animated: true });
          }
        });
      },
      (error) => {
        console.warn('Failed to load chat messages', error);
        setToast({ message: 'Unable to load this conversation.', variant: 'danger' });
        setTimeout(() => setToast(null), 2400);
      }
    );

    return unsubscribe;
  }, [chatId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !chatId || !currentUserId || sending) {
      return;
    }

    setSending(true);
    setDraft('');

    try {
      await sendChatMessage(chatId, { text, senderId: currentUserId });
    } catch (error) {
      console.warn('Failed to send chat message', error);
      setDraft(text);
      setToast({ message: 'Message not delivered. Please try again.', variant: 'danger' });
      setTimeout(() => setToast(null), 2200);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUserId;
    const bubbleStyles = [
      styles.messageBubble,
      isCurrentUser ? styles.bubbleSelf : styles.bubblePeer
    ];
    const textStyles = [
      styles.messageText,
      isCurrentUser ? styles.textSelf : styles.textPeer
    ];
    const timeStyles = [
      styles.messageTime,
      isCurrentUser ? styles.timeSelf : styles.timePeer
    ];
    const createdAtLabel = formatMessageTime(item.createdAt);

    return (
      <View style={[styles.messageRow, isCurrentUser ? styles.rowSelf : styles.rowPeer]}>
        <View style={bubbleStyles}>
          <Text style={textStyles}>{item.text}</Text>
          <Text style={timeStyles}>{createdAtLabel}</Text>
        </View>
      </View>
    );
  };

  const listEmptyComponent = (
    <View style={styles.emptyWrapper}>
      <Ionicons name="chatbubble-ellipses-outline" size={28} color={colors.mutedAlt} />
      <Text style={styles.emptyText}>Say hello to start the conversation.</Text>
    </View>
  );

  if (!chatId) {
    return (
      <Screen inset={false} style={styles.screen}>
        <Text style={styles.missingChat}>Chat not found.</Text>
      </Screen>
    );
  }

  const consultationLabel = consultationId ? Consultation ... : 'Consultation chat';
  const disableSend = !draft.trim() || sending;

  return (
    <Screen inset={false} style={styles.screen}>
      {toast ? (
        <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} />
      ) : null}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 72 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.primaryText} />
          </TouchableOpacity>
          <View style={styles.headerMeta}>
            <Text style={styles.headerTitle} numberOfLines={1}>{participantName}</Text>
            <Text style={styles.headerSubtitle}>{consultationLabel}</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={listEmptyComponent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedAlt}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, disableSend && styles.sendButtonDisabled]}
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={disableSend}
          >
            <Ionicons name="send" size={18} color={colors.primaryText} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function formatMessageTime(ms) {
  if (!ms) {
    return 'Sending...';
  }

  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) {
    return 'Sending...';
  }

  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  missingChat: {
    color: colors.subtleText,
    textAlign: 'center',
    marginTop: 120,
    fontSize: 16
  },
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerMeta: {
    flex: 1,
    marginHorizontal: 16,
    gap: 4
  },
  headerTitle: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: '700'
  },
  headerSubtitle: {
    color: colors.mutedAlt,
    fontSize: 12
  },
  headerSpacer: {
    width: 40
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingBottom: 12
  },
  messageRow: {
    paddingVertical: 4
  },
  rowSelf: {
    alignItems: 'flex-end'
  },
  rowPeer: {
    alignItems: 'flex-start'
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  bubbleSelf: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6
  },
  bubblePeer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    borderBottomLeftRadius: 6
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20
  },
  textSelf: {
    color: colors.primaryText
  },
  textPeer: {
    color: colors.subtleText
  },
  messageTime: {
    fontSize: 11,
    marginTop: 6
  },
  timeSelf: {
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'right'
  },
  timePeer: {
    color: colors.mutedAlt
  },
  emptyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12
  },
  emptyText: {
    color: colors.mutedAlt,
    fontSize: 14
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 120,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    color: colors.primaryText,
    borderWidth: 1,
    borderColor: colors.outline
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonDisabled: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    opacity: 0.5
  }
});
