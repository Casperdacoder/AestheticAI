import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { colors } from '../components/UI';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const sampleEarnings = [
  { id: '1', title: 'Consultation with John', amount: 50 },
  { id: '2', title: 'Booking: Design Project', amount: 120 },
  { id: '3', title: 'Consultation with Sarah', amount: 75 },
];

export default function EarningsScreen() {
  const [userName, setUserName] = useState('Loading...');
  const [photoURL, setPhotoURL] = useState(null);

  const totalEarnings = sampleEarnings.reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || 'Designer');
        setPhotoURL(user.photoURL || null);
      }
    });
    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.transactionCard}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemAmount}>₱{item.amount}</Text>
    </View>
  );

  const handleWithdraw = () => {
    console.log('Withdraw button pressed');
    // Pwede dito ilagay ang logic para sa withdrawal
  };

  return (
    <View style={styles.container}>
      
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

      {/* 🔹 Total Earnings Card */}
      <View style={styles.earningsCard}>
        <View>
          <Text style={styles.earningsLabel}>Total Earnings</Text>
          <Text style={styles.earningsAmount}>₱{totalEarnings}</Text>
        </View>
        <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
          <Text style={styles.withdrawText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>Recent Transactions</Text>
      <FlatList
        data={sampleEarnings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({

  

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
    marginBottom: 20
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
  /* Earnings Card */
  earningsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 20,
    margin: 10,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  earningsLabel: { fontSize: 16, color: colors.primaryText },
  earningsAmount: { fontSize: 28, fontWeight: '700', color: colors.primaryText, marginTop: 4 },
  withdrawButton: {
    backgroundColor:'#91f90976',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  withdrawText: { color: '#fff', fontWeight: '600' },

  subHeader: {
       fontSize: 18, fontWeight: '700', color: colors.primary, fontFamily: 'serif', marginStart: 20, marginBottom:15, },



  /* Recent Transactions */
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemTitle: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500'
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary
  }
});
