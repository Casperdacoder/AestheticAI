// src/screens/VerificationsScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from "../services/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { colors } from '../components/UI';

export default function VerificationsScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingConsultants = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "consultants"),
          where("status", "==", "pending")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVerifications(data);
      } catch (error) {
        console.error("Error fetching consultants:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchPendingConsultants(); // auto-refresh kapag bumalik sa screen
    }
  }, [isFocused]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
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
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f4f4f4' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Hero Section */}
        <View style={screenStyles.hero}>
          <View style={screenStyles.heroText}>
            <Text style={screenStyles.heroTitle}>Verifications</Text>
            <Text style={screenStyles.heroSubtitle}>Manage pending consultant accounts</Text>
          </View>
          <TouchableOpacity style={screenStyles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* List of pending consultants */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          {verifications.length === 0 ? (
            <Text style={{ textAlign: "center", color: "#888", marginTop: 40 }}>
              No pending consultants.
            </Text>
          ) : (
            verifications.map(item => (
              <View key={item.id} style={screenStyles.card}>
                {/* Left info */}
                <View style={screenStyles.cardInfo}>
                  <Text style={screenStyles.name}>{item.fullName}</Text>
                  <Text style={screenStyles.infoText}>Email: {item.email}</Text>
                </View>

                {/* Right button */}
                <TouchableOpacity
                  style={screenStyles.viewButton}
                  onPress={() => navigation.navigate("VerificationDetail", { data: item })}
                >
                  <Text style={screenStyles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const screenStyles = StyleSheet.create({
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

  card: {
    flexDirection: 'row', // para left-right layout
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardInfo: { flex: 1, paddingRight: 10 }, // left side info

  name: { fontSize: 16, fontWeight: '700', color: '#2C3E50', marginBottom: 4 },
  infoText: { fontSize: 14, color: '#2C3E50', marginBottom: 2 },

  viewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  viewButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
