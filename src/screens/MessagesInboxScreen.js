import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen, colors, Toast } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { getCachedUserRole } from '../services/userCache';

const MESSAGES = [
  { id: '1', name: 'Consultant Name', preview: 'Last Message.....', timestamp: 'Yesterday, 5:42 PM' },
  { id: '2', name: 'Designer Team', preview: 'Draft moodboard ready', timestamp: 'Yesterday, 5:10 PM' }
];

export default function MessagesInboxScreen({ navigation }) {
  const [isDesigner, setIsDesigner] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const resolveRole = async () => {
      try {
        const uid = auth.currentUser?.uid;
        const cachedRole = uid ? await getCachedUserRole(uid) : null;
        if (isMounted) {
          setIsDesigner((cachedRole || 'user') === 'designer');
          setRoleChecked(true);
        }
      } catch (error) {
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
  }, []);

  const handleAttempt = () => {
    setToast({ message: 'Consultant tools are available on designer accounts.', variant: 'info' });
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <Screen inset={false} style={styles.screen}>
      {toast ? (
        <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} />
      ) : null}

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.identity}>
            <View style={styles.avatar} />
            <Ionicons name="ribbon-outline" size={20} color={colors.accent} />
          </View>
          <Ionicons name="notifications-outline" size={24} color={colors.primaryText} />
        </View>
        <Text style={styles.welcome}>Welcome Username!</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Messages</Text>
        {MESSAGES.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.messageCard}
            activeOpacity={isDesigner ? 0.82 : 1}
            onPress={isDesigner ? () => navigation.navigate('Consultant') : handleAttempt}
            disabled={!roleChecked}
          >
            <View style={styles.leadingIcon}>
              <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.messageName}>{item.name}</Text>
              <Text style={styles.messagePreview}>{item.preview}</Text>
              <Text style={styles.messageTime}>{item.timestamp}</Text>
            </View>
            <Ionicons
              name={isDesigner ? 'chevron-forward' : 'lock-closed-outline'}
              size={18}
              color={isDesigner ? colors.subtleText : colors.mutedAlt}
            />
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background
  },
  hero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 28
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
    fontWeight: '700',
    marginTop: 20
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16
  },
  heading: {
    color: colors.subtleText,
    fontSize: 18,
    fontWeight: '700'
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outline,
    marginTop: 16,
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
  messageName: {
    color: colors.primaryText,
    fontWeight: '700',
    fontSize: 16
  },
  messagePreview: {
    color: colors.subtleText,
    fontSize: 13,
    marginTop: 2
  },
  messageTime: {
    color: colors.mutedAlt,
    fontSize: 12,
    marginTop: 4
  }
});
