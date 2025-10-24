import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  background: '#F8F9FA',
  primary: '#0E5258',
  primaryText: '#FFFFFF',
  surface: '#FFFFFF',
  outline: '#E0E0E0',
  subtleText: '#555555',
  mutedAlt: '#999999',
};

export default function MessagesInboxScreenMock() {
  const [chats] = useState([
    {
      id: '1',
      name: 'Alex Rivera',
      lastMessage: 'Hey! How’s the project going?',
      time: '2h ago',
    },
    {
      id: '2',
      name: 'Jamie Cruz',
      lastMessage: 'Sure, let’s schedule our next meeting.',
      time: 'Yesterday',
    },
    {
      id: '3',
      name: 'Taylor Lee',
      lastMessage: 'Awesome work on the last task!',
      time: 'Oct 22',
    },
  ]);

  const displayName = 'Noelyn';

  const openChat = (chat) => {
    console.log(`Opening chat with ${chat.name}`);
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.messageCard}
      activeOpacity={0.85}
      onPress={() => openChat(item)}
    >
      <View style={styles.leadingIcon}>
        <Ionicons name="chatbubbles-outline" size={24} color={colors.primary} />
      </View>
      <View style={styles.chatBody}>
        <Text style={styles.messageName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.messagePreview} numberOfLines={1}>
          {item.lastMessage}
        </Text>
        <Text style={styles.messageTime}>{item.time}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.subtleText}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.avatar}>
            <Ionicons name="person-circle-outline" size={36} color="#fff" />
          </View>
          <TouchableOpacity style={styles.notificationWrapper}>
            <Ionicons
              name="notifications-outline"
              size={42}
              color={colors.primaryText}
            />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.welcome}>Welcome {displayName}!</Text>
        <Text style={styles.heroSubtitle}>
          Chat with your consultant or designer anytime.
        </Text>
      </View>

      {/* Messages Section */}
      <View style={styles.content}>
        <View style={styles.headingRow}>
          <Text style={styles.heading}>Conversations</Text>
        </View>
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 12,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationWrapper: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  welcome: {
    color: colors.primaryText,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'serif',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 13,
    lineHeight: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    color: colors.subtleText,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  separator: {
    height: 12,
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
    color: '#000',
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
});
