import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '../components/UI';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export default function ConsultantBookingScreen({ navigation }) {
  const [userName, setUserName] = useState('Loading...');
  const [photoURL, setPhotoURL] = useState(null);

  // 🔹 Mock consultation data
  const [consultations, setConsultations] = useState([]);

  // 🔹 Fetch user info + mock data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserName(user.displayName || 'Designer');
        setPhotoURL(user.photoURL || null);

        // Mock consultations
        setConsultations([
          { id: 1, client: 'John Doe', time: '10:00 AM', status: 'pending' },
          { id: 2, client: 'Mary Smith', time: '11:30 AM', status: 'pending' },
          { id: 3, client: 'Alex Johnson', time: '2:00 PM', status: 'accepted' },
        ]);
      } else {
        await signInAnonymously(auth);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Accept or Reject consultation
  const updateStatus = (id, newStatus) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  // 🔹 Open Chat (placeholder for navigation)
  const openChat = (clientName) => {
    console.log(`Opening chat with ${clientName}`);
    // Example navigation (uncomment when using react-navigation)
    // navigation.navigate('ConsultantChatScreen', { clientName });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      
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

      <Text style={styles.header}>Bookings</Text>
      
      {consultations.map((c) => (
        <View key={c.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.clientName}>{c.client}</Text>
            <Text style={[styles.status, 
              c.status === 'accepted' ? styles.accepted : 
              c.status === 'rejected' ? styles.rejected : styles.pending
            ]}>
              {c.status.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.time}>{c.time}</Text>

          {c.status === 'pending' ? (
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.acceptButton]} 
                onPress={() => updateStatus(c.id, 'accepted')}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.rejectButton]} 
                onPress={() => updateStatus(c.id, 'rejected')}
              >
                <Ionicons name="close" size={20} color="#fff" />
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          ) : c.status === 'accepted' ? (
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.chatButton]} 
                onPress={() => openChat(c.client)}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Open Chat</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({


  hero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
     paddingVertical: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
 welcomeText: { fontSize: 14, color: '#E0E0E0' , marginTop: 50,},
  userNameText: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 2 },

  avatarImage: { width: 60, height: 60, borderRadius: 30,marginTop: 50,},
  avatar: {
    width: 62,
    height: 62,
    marginTop: 50,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {fontSize: 18, fontWeight: '700', marginVertical: 10, color: colors.primary, fontFamily: 'serif', marginStart: 20, marginTop: 20, },


  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clientName: { fontSize: 16, fontWeight: '600', color: colors.primary },
  status: { fontSize: 14, fontWeight: '600' },
  pending: { color: '#FFA500' },
  accepted: { color: '#2A9D8F' },
  rejected: { color: '#E63946' },

  time: { marginTop: 8, fontSize: 14, color: colors.subtleText },

  actions: { flexDirection: 'row', marginTop: 12, gap: 10 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8 },
  acceptButton: { backgroundColor: '#2A9D8F', flex: 1 },
  rejectButton: { backgroundColor: '#E63946', flex: 1 },
  chatButton: { backgroundColor: '#316d79ff', flex: 1 },
  buttonText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
});
