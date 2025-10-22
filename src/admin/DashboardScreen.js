// src/admin/screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, SafeAreaView, Alert } from 'react-native';
import { Card, colors } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";

export default function DashboardScreen() {
  const navigation = useNavigation();

  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    withdrawPending: 0,
    verifiedConsultants: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats({
          totalUsers: 1234,
          pendingVerifications: 27,
          withdrawPending: 12,
          verifiedConsultants: 56,
        });
      } catch (err) {
        console.log('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  const cardData = [
    { id: '1', title: 'Total Users', value: stats.totalUsers, icon: 'people', navigate: 'UpdateInformation', bgColor: '#2A9D8F' },
    { id: '2', title: 'Pending Verifications', value: stats.pendingVerifications, icon: 'alert-circle', navigate: 'UpdateInformation', bgColor: '#E76F51' },
    { id: '3', title: 'Withdraw Pending', value: stats.withdrawPending, icon: 'cash-outline', navigate: 'UpdateInformation', bgColor: '#F4A261' },
    { id: '4', title: 'Verified Consultants', value: stats.verifiedConsultants, icon: 'checkmark-circle', navigate: 'UpdateInformation', bgColor: '#264653' },
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Hero Section
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
  heroTitle: {
    color: '#fff',
    fontSize: 25,
    fontWeight: '900',
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f0f0f0',
    marginTop: 6,
  },
  logoutButton: { marginLeft: 10, padding: 8 },

  cardGrid: {
    flexDirection: 'column',
    marginHorizontal: 16,
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderColor: 0,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e1d1dff',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#262525ff',
    marginTop: 4,
  },
});
