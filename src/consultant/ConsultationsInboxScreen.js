import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar, 
  Image 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../components/UI';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function MessagesInboxScreen({ navigation }) {
  const [messages, setMessages] = useState([]);
  const [userName, setUserName] = useState('Loading...');
  const [photoURL, setPhotoURL] = useState(null);

  useEffect(() => {
    // 🔹 Mock data for sample messages
    setMessages([
      { id: 1, user: 'Client A', lastMessage: 'Can you send me the latest draft?', time: '5:45 PM', unread: 1 },
      { id: 2, user: 'Designer B', lastMessage: 'Let’s discuss the revisions tomorrow.', time: 'Yesterday', unread: 0 },
      { id: 3, user: 'Consultant C', lastMessage: 'Thanks for your feedback!', time: '2 days ago', unread: 3 },
    ]);

    // 🔹 Mock authentication listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || 'User');
        setPhotoURL(user.photoURL || null);
      } else {
        setUserName('Guest');
        setPhotoURL(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.surfaceMuted} />

      {/* 🔹 Hero Section */}
      <View style={styles.hero}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Ionicons name="person-circle-outline" size={50} color="#fff" />
          </View>
        )}
        <View style={styles.heroTextContainer}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.userNameText}>{userName}!</Text>
        </View>
      </View>

      {/* 🔹 Title */}
      <Text style={styles.sectionTitle}>Messages</Text>

      {/* 🔹 Message List */}
      {messages.map((msg) => (
        <TouchableOpacity 
          key={msg.id} 
          style={styles.card}
          onPress={() => navigation.navigate('ChatScreen', { chatId: msg.id })}
        >
          <View style={styles.leadingIcon}>
            <Ionicons name="chatbubbles-outline" size={44} color={colors.primary} />
          </View>

          <View style={styles.chatBody}>
            <View style={styles.cardHeader}>
              <Text style={styles.userName}>{msg.user}</Text>
              <Text style={styles.time}>{msg.time}</Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.lastMessage} numberOfLines={1}>{msg.lastMessage}</Text>
              {msg.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{msg.unread}</Text>
                </View>
              )}
            </View>
          </View>

          <Ionicons name="chevron-forward" size={18} color={colors.subtleText} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* Hero Section */
  hero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 50,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: 50,
  },
  avatar: {
    width: 62,
    height: 62,
    marginTop: 50,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Section Title */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 10,
    color: colors.primary,
    fontFamily: 'serif',
    marginStart: 20,
  },

  /* Message Cards */
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryText,
    margin: 10,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outline,
    marginBottom: 12,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
  time: {
    color: colors.subtleText,
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  lastMessage: {
    color: colors.subtleText,
    fontSize: 13,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#E63946',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
