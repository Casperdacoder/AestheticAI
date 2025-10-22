import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../components/UI';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export default function ConsultantDashboardScreen() {
  const [userName, setUserName] = useState('Loading...');
  const [photoURL, setPhotoURL] = useState(null);

  // 🔹 Dynamic data states
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [earnings, setEarnings] = useState(0);

  // 🔹 Fetch user info + mock data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserName(user.displayName || 'Designer');
        setPhotoURL(user.photoURL || null);

        // 🔹 Mock dynamic data
        setUpcomingBookings([
          { id: 1, client: 'John' },
          { id: 2, client: 'Mary' },
          { id: 3, client: 'Alex' },
        ]);
        setConsultations([
          { id: 1, client: 'Ethan' },
          { id: 2, client: 'Sabrina' },
        ]);
        setEarnings(245);
      } else {
        await signInAnonymously(auth);
      }
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Cards with dynamic info
  const dashboardCards = [
    { 
      id: '1', 
      title: 'Upcoming Bookings', 
      icon: 'calendar', 
      bg: '#316d79ff', 
      info: `You have ${upcomingBookings.length} booking${upcomingBookings.length !== 1 ? 's' : ''} this week.` 
    },
    { 
      id: '2', 
      title: 'Consultations', 
      icon: 'chatbubbles', 
      bg: '#2A9D8F', 
      info: `You have ${consultations.length} consultation${consultations.length !== 1 ? 's' : ''} pending.` 
    },
    { 
      id: '3', 
      title: 'Earnings', 
      icon: 'cash', 
      bg: '#2f7bb9ff', 
      info: `${earnings} earned this month.` 
    },
  ];

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

      {/* 🔹 Dashboard Cards (Vertical Column) */}
      <View style={styles.header}>
        {dashboardCards.map((card) => (
          <View key={card.id} style={styles.card}>
            <View style={styles.cardContent}>
              {/* Left: Icon with circle background */}
              <View style={[styles.iconWrapper, { backgroundColor: card.bg }]}>
                <Ionicons name={card.icon} size={28} color="#fff" />
              </View>

              {/* Right: Info line + Title */}
              <View style={styles.textWrapper}>
                   {/* 🔹 Title below */}
                <Text style={styles.cardTitle}>{card.title}</Text>
                {/* 🔹 Info line above */}
                <Text style={styles.cardInfoTop}>{card.info}</Text>

             
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

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
  header: { marginTop: 30, paddingHorizontal: 20 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  iconWrapper: { 
    width: 50, 
    height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  textWrapper: { flex: 1 },
  cardInfoTop: { 
    fontSize: 14, 
    color: colors.subtleText, 
    marginBottom: 4, 
    fontWeight: '500' 
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.primary},
});
