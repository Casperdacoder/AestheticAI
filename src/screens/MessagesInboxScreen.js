import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, StatusBar } from 'react-native';
import { Screen, colors, Toast } from '../components/UI';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { getCachedUserRole } from '../services/userCache';

const MESSAGES = [
  { 
    id: '1', 
    name: 'Engr. Sophia Reyes', 
    preview: 'Sure! Let’s schedule a follow-up to refine your design layout.', 
    timestamp: '10:22 AM' 
  },
  { 
    id: '2', 
    name: 'Ar. John Dela Cruz', 
    preview: 'I sent the revised moodboard. Check if the colors feel right for you.', 
    timestamp: '9:14 PM' 
  },
  { 
    id: '3', 
    name: 'AestheticAI Consultant', 
    preview: 'The AI visualization is ready for your approval — want to proceed?', 
    timestamp: 'Oct 19' 
  },
  { 
    id: '4', 
    name: 'IDr. Carla Mendoza', 
    preview: 'Your consultation request is confirmed for Oct 23 at 2:00 PM.', 
    timestamp: 'Oct 18' 
  },
];

export default function MessagesInboxScreen({ navigation }) {
  const [toast, setToast] = useState(null);
  const [userName, setUserName] = useState('Username');
  const [photoURL, setPhotoURL] = useState(null);
  const [notifications, setNotifications] = useState([{ id: 1 }, { id: 2 }]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    const displayName = auth.currentUser?.displayName || 'Username';
    const avatar = auth.currentUser?.photoURL || null;

    setUserName(displayName);
    setPhotoURL(avatar);
  }, []);

  const handleNotificationsPress = () => {
    setToast({ message: 'Notifications opened.', variant: 'success' });
    setTimeout(() => setToast(null), 1500);
  };

  const handleEditAccount = () => {
    navigation.navigate('ManageAccount');
  };

  return (
    <Screen inset={false} style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surfaceMuted} />
      {toast ? (
        <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} />
      ) : null}

      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.identity}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person-circle" size={55} color="#FFFFFF" />
              </View>
            )}
            <TouchableOpacity onPress={handleEditAccount} style={styles.crownWrapper}>
              <FontAwesome5 name="crown" size={24} color="#FFD700" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleNotificationsPress} style={styles.notificationWrapper}>
            <Ionicons name="notifications-outline" size={42} color={colors.primaryText} />
            {notifications.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.welcome}>Welcome, {userName}!</Text>
      </View>

      {/* Messages Section */}
      <View style={styles.content}>
        <Text style={styles.heading}>Messages</Text>
        {MESSAGES.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.messageItem}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ConsultantChat', { consultantName: item.name })}
          >
            <Ionicons name="person-circle-outline" size={50} color={colors.primary} style={styles.messageIcon} />
            <View style={styles.messageTextSection}>
              <View style={styles.messageHeader}>
                <Text style={styles.messageName}>{item.name}</Text>
                <Text style={styles.messageTime}>{item.timestamp}</Text>
              </View>
              <Text style={styles.messagePreview} numberOfLines={1}>
                {item.preview}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  hero: {
    backgroundColor: colors.surfaceMuted,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 35 : 75,
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -18,
  },
  avatarImage: {
    width: 55,
    height: 55,
    borderRadius: 28,
    marginLeft: 8,
  },
  crownWrapper: {
    marginLeft: -5,
    marginTop: 2,
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
    marginTop: 35,
    fontFamily: 'serif',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  heading: {
    color: colors.subtleText,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  messageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#D1D1D1', // gray line separator
  },
  messageIcon: {
    marginRight: 12,
  },
  messageTextSection: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageName: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
  messagePreview: {
    color: colors.subtleText,
    fontSize: 13,
    marginTop: 3,
  },
  messageTime: {
    color: colors.mutedAlt,
    fontSize: 11,
  },
});
