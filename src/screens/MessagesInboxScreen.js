import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Toast, colors } from '../components/UI';
import { auth } from '../services/firebase';
import { getCachedUserRole } from '../services/userCache';
import { listenToUserChats } from '../services/chat';

export default function MessagesInboxScreen({ navigation }) {
  const [currentUserId, setCurrentUserId] = useState(auth.currentUser?.uid || null);
  const [isDesigner, setIsDesigner] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

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

        const role = await getCachedUserRole(currentUserId);
        if (isMounted) {
          setIsDesigner((role || 'user') === 'designer');
          setRoleChecked(true);
        }
      } catch (error) {
        console.warn('Unable to resolve user role', error);
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
        console.warn('Failed to load chats', error);
        setChats([]);
        setLoading(false);
        setToast({ message: 'Unable to load your inbox.', variant: 'danger' });
        setTimeout(() => setToast(null), 2400);
      }
    );

    return unsubscribe;
  }, [currentUserId]);

  const heroSubtitle = useMemo(() => {
    if (!roleChecked) {
      return 'Checking your workspace…';
    }
    return isDesigner
      ? 'Connect with clients and manage consultation updates.'
      : 'Stay in touch with your consultant and track project notes.';
  }, [isDesigner, roleChecked]);

  const renderItem = ({ item }) => {
    const metadata = item.participantMetadata || {};
    const participants = item.participants || [];
    const peerId = participants.find((id) => id !== currentUserId) || participants[0];
    const peerName = metadata[peerId]?.name || 'Conversation';
    const lastSnippet = item.lastMessage || 'Tap to view conversation';
    const timestamp = item.lastMessageAt || item.updatedAt || item.createdAt;

    return (
      <TouchableOpacity
        style={styles.messageCard}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('Chat', {
            chatId: item.id,
            participantName: peerName,
            consultationId: item.consultationId || null,
          })
        }
      >
        <View style={styles.leadingIcon}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.chatBody}>
          <Text style={styles.messageName} numberOfLines={1}>
            {peerName}
          </Text>
          <Text style={styles.messagePreview} numberOfLines={1}>
            {lastSnippet}
          </Text>
        </View>
        <Text style={styles.messageTime}>{formatRelativeTime(timestamp)}</Text>
      </TouchableOpacity>
    );
  };

  const listEmpty = (
    <View style={styles.emptyContainer}>
      <Ionicons name="mail-open-outline" size={28} color={colors.mutedAlt} />
      <Text style={styles.emptyText}>
        {loading ? 'Loading your conversations…' : 'No messages yet. Start a chat to collaborate.'}
      </Text>
    </View>
  );

  return (
    <Screen inset={false} style={styles.screen}>
      {toast ? (
        <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} />
      ) : null}

      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <Text style={styles.welcome}>Messages</Text>
          {isDesigner ? (
            <TouchableOpacity
              style={styles.heroAction}
              onPress={() => navigation.navigate('Consultant')}
              activeOpacity={0.8}
            >
              <Ionicons name="briefcase-outline" size={18} color={colors.primaryText} />
              <Text style={styles.heroActionText}>Open Studio</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
      </View>

      <View style={styles.content}>
        {loading && chats.length === 0 ? (
          <View style={styles.loaderRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loaderText}>Syncing messages…</Text>
          </View>
        ) : null}

        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={chats.length === 0 ? styles.emptyPadding : styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Screen>
  );
}

function formatRelativeTime(timestamp) {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = Date.now();
  const diff = now - date.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    return 'now';
  }
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d`;
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 24,
    backgroundColor: '#0F3E48',
    gap: 12,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcome: {
    color: colors.primaryText,
    fontSize: 24,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    lineHeight: 19,
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  heroActionText: {
    color: colors.primaryText,
    fontWeight: '600',
    fontSize: 13,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  loaderText: {
    color: colors.mutedAlt,
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyPadding: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 80,
  },
  separator: {
    height: 14,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outline,
    gap: 16,
  },
  leadingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(14,82,88,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBody: {
    flex: 1,
    gap: 4,
  },
  messageName: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 15,
  },
  messagePreview: {
    color: colors.subtleText,
    fontSize: 13,
  },
  messageTime: {
    color: colors.mutedAlt,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: colors.mutedAlt,
    fontSize: 14,
    textAlign: 'center',
  },
});
