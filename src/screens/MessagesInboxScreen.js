import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Screen, colors, Toast } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { getCachedUserRole } from '../services/userCache';
import { listenToUserChats } from '../services/chat';

export default function MessagesInboxScreen({ navigation }) {
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid || null);
  const [isDesigner, setIsDesigner] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [toast, setToast] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof auth.onAuthStateChanged === 'function') {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setCurrentUserId(user?.uid || null);
      });
      return unsubscribe;
    }
    return undefined;
  }, []);

  useEffect(() => {
    let isMounted = true;
    const resolveRole = async () => {
      try {
        if (!currentUserId) {
          if (isMounted) {
            setIsDesigner(false);
            setRoleChecked(true);
          }
          return;
        }
        const cachedRole = await getCachedUserRole(currentUserId);
        if (isMounted) {
          setIsDesigner((cachedRole || 'user') === 'designer');
          setRoleChecked(true);
        }
      } catch (error) {
        console.warn('Failed to resolve user role', error);
        if (isMounted) {
          setIsDesigner(false);
          setRoleChecked(true);
        }
      }
    };
    resolveRole();
    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listenToUserChats(
      currentUserId,
      (items) => {
        setChats(items);
        setLoading(false);
      },
      (error) => {
        console.warn('Failed to subscribe to chats', error);
        setToast({ message: 'Unable to load your conversations right now.', variant: 'danger' });
        setTimeout(() => setToast(null), 2400);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [currentUserId]);

  const openChat = (chat) => {
    if (!chat?.id) {
      return;
    }
    navigation.navigate('Chat', {
      chatId: chat.id,
      consultationId: chat.consultationId || null,
      participantName: getPeerName(chat, currentUserId)
    });
  };

  const renderChatItem = ({ item }) => {
    const chatName = getPeerName(item, currentUserId);
    const preview = item.lastMessage || 'Tap to start the conversation.';
    const timestampLabel = formatTimestamp(item.lastMessageAt || item.updatedAt);
    return (
      <TouchableOpacity
        style={styles.messageCard}
        activeOpacity={0.85}
        onPress={() => openChat(item)}
      >
        <View style={styles.leadingIcon}>
          <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.chatBody}>
          <Text style={styles.messageName} numberOfLines={1}>{chatName}</Text>
          <Text style={styles.messagePreview} numberOfLines={1}>{preview}</Text>
          <Text style={styles.messageTime}>{timestampLabel}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.subtleText} />
      </TouchableOpacity>
    );
  };

  const listEmptyComponent = !loading ? (
    <Text style={styles.emptyState}>
      {roleChecked
        ? 'No conversations yet. Once a consultation is accepted you can chat here.'
        : 'Checking your messages...'}
    </Text>
  ) : null;

  const displayName = auth.currentUser?.displayName || (isDesigner ? 'Designer' : 'there');

  return (
    <Screen inset={false} style={styles.screen}>
      {toast ? (
        <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} />
      ) : null}

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.identity}>
            <View style={styles.avatar} />
            <Ionicons
              name={isDesigner ? 'ribbon-outline' : 'person-circle-outline'}
              size={20}
              color={colors.accent}
            />
          </View>
          <Ionicons name="notifications-outline" size={24} color={colors.primaryText} />
        </View>
        <Text style={styles.welcome}>Welcome {displayName}!</Text>
        <Text style={styles.heroSubtitle}>
          {isDesigner
            ? 'Stay connected with your clients in real time.'
            : 'Chat with your consultant the moment they accept.'}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.headingRow}>
          <Text style={styles.heading}>Conversations</Text>
          {loading ? <ActivityIndicator size="small" color={colors.primaryText} /> : null}
        </View>
        {!currentUserId && !loading ? (
          <Text style={styles.emptyState}>Sign in to start messaging.</Text>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={listEmptyComponent}
            contentContainerStyle={chats.length === 0 ? styles.emptyContainer : null}
            style={styles.chatList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Screen>
  );
}

function formatTimestamp(ms) {
  if (!ms) {
    return 'Just now';
  }

  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return 'Just now';
  }
  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  }
  if (diff < day) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getPeerName(chat, currentUserId) {
  if (!chat?.participantMetadata) {
    return 'Conversation';
  }

  const entries = Object.entries(chat.participantMetadata);
  for (const [participantId, metadata] of entries) {
    if (participantId !== currentUserId && metadata?.name) {
      return metadata.name;
    }
  }

  const fallback = entries.find(([participantId]) => participantId !== currentUserId);
  if (fallback && fallback[1]) {
    return fallback[1].name || 'Conversation';
  }

  return 'Conversation';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  hero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 12
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface
  },
  welcome: {
    color: colors.primaryText,
    fontSize: 22,
    fontWeight: '700'
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 18
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  heading: {
    color: colors.subtleText,
    fontSize: 18,
    fontWeight: '700'
  },
  separator: {
    height: 12
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outline,
    gap: 16
  },
  leadingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt
  },
  chatBody: {
    flex: 1,
    gap: 4
  },
  messageName: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 16
  },
  messagePreview: {
    color: colors.subtleText,
    fontSize: 13
  },
  messageTime: {
    color: colors.mutedAlt,
    fontSize: 12
  },
  emptyState: {
    color: colors.mutedAlt,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  chatList: {
    flex: 1
  }
});
