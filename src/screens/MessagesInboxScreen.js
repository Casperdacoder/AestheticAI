import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, colors, Toast } from '../components/UI';
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
    if (typeof auth.onAuthStateChanged !== 'function') {
      return undefined;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUserId(user?.uid || null);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let mounted = true;

    const resolveRole = async () => {
      try {
        if (!currentUserId) {
          if (mounted) {
            setIsDesigner(false);
            setRoleChecked(true);
          }
          return;
        }
        const cachedRole = await getCachedUserRole(currentUserId);
        if (mounted) {
          setIsDesigner((cachedRole || 'user') === 'designer');
          setRoleChecked(true);
        }
      } catch (error) {
        console.warn('Failed to resolve user role', error);
        if (mounted) {
          setIsDesigner(false);
          setRoleChecked(true);
        }
      }
    };

    resolveRole();

    return () => {
      mounted = false;
    };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) {
      setChats([]);
      setLoading(false);
      return undefined;
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

  const handleNotificationsPress = () => {
    setToast({ message: 'Notifications opened.', variant: 'info' });
    setTimeout(() => setToast(null), 1800);
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
      <StatusBar barStyle="light-content" backgroundColor={colors.surfaceMuted} />
      {toast ? <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} /> : null}

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <Ionicons
                name={isDesigner ? 'color-palette-outline' : 'person-circle-outline'}
                size={32}
                color={colors.primaryText}
              />
            </View>
          </View>

          <TouchableOpacity onPress={handleNotificationsPress} style={styles.notificationWrapper}>
            <Ionicons name="notifications-outline" size={36} color={colors.primaryText} />
          </TouchableOpacity>
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

  for (const [participantId, metadata] of Object.entries(chat.participantMetadata)) {
    if (participantId !== currentUserId && metadata?.name) {
      return metadata.name;
    }
  }

  return 'Conversation';
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  hero: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
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
    gap: 10
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  notificationWrapper: {
    position: 'relative'
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
    paddingVertical: 24
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(14,82,88,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chatBody: {
    flex: 1,
    gap: 4
  },
  messageName: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 15
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
