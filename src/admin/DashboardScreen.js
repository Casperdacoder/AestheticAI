// src/admin/screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Card, colors } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from "../services/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    withdrawPending: 0,
    verifiedConsultants: 0,
  });

  useEffect(() => {
    const usersRef = collection(db, "users");
    const consultantsRef = collection(db, "consultants");

    // Listen to total users
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      setStats(prev => ({ ...prev, totalUsers: snapshot.size }));
    });

    // Listen to pending verifications
    const qPending = query(consultantsRef, where("status", "==", "pending"));
    const unsubscribePending = onSnapshot(qPending, (snapshot) => {
      setStats(prev => ({ ...prev, pendingVerifications: snapshot.size }));
    });

    // Listen to verified consultants
    const qVerified = query(consultantsRef, where("status", "==", "verified"));
    const unsubscribeVerified = onSnapshot(qVerified, (snapshot) => {
      setStats(prev => ({ ...prev, verifiedConsultants: snapshot.size }));
    });

    // Placeholder for withdrawPending (add your logic if needed)
    setStats(prev => ({ ...prev, withdrawPending: 0 }));

    setLoading(false);

    return () => {
      unsubscribeUsers();
      unsubscribePending();
      unsubscribeVerified();
    };
  }, []);

 const cardData = [
  { id: '1', title: 'Total Users', value: stats.totalUsers, icon: 'people', navigate: 'AccountsScreen', bgColor: '#2A9D8F' },
  { id: '2', title: 'Pending Verifications', value: stats.pendingVerifications, icon: 'alert-circle', navigate: 'AccountsScreen', bgColor: '#E76F51' },
  { id: '3', title: 'Withdraw Pending', value: stats.withdrawPending, icon: 'cash-outline', navigate: 'AccountsScreen', bgColor: '#F4A261' },
  { id: '4', title: 'Verified Consultants', value: stats.verifiedConsultants, icon: 'checkmark-circle', navigate: 'AccountsScreen', bgColor: '#264653' },
];


  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            signOut(auth)
              .then(() => navigation.replace("AdminLogin"))
              .catch((error) => Alert.alert("Error", error.message));
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Welcome Admin</Text>
            <Text style={styles.heroSubtitle}>Dashboard Overview</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Cards */}
        <View style={styles.cardGrid}>
          {cardData.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(item.navigate)}
            >
              <Card style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={[styles.iconCircle, { backgroundColor: item.bgColor }]}>
                    <Ionicons name={item.icon} size={24} color="#fff" />
                  </View>

                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardValue}>{item.value}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    height: 160,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
    paddingTop: 40,
  },
  heroText: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: 25, fontWeight: '900' },
  heroSubtitle: { fontSize: 16, fontWeight: '600', color: '#f0f0f0', marginTop: 6 },
  logoutButton: { marginLeft: 10, padding: 8 },
  cardGrid: { flexDirection: 'column', marginHorizontal: 16 },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    marginBottom: 16,
  },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e1d1dff' },
  cardValue: { fontSize: 22, fontWeight: '900', color: '#262525ff', marginTop: 4 },
});
