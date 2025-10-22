import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { colors } from "../components/UI"; 
import { Ionicons } from '@expo/vector-icons'; 
import { auth } from "../services/firebase"; // siguraduhing meron kang auth export
import { signOut } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';

export default function WithdrawalsScreen() {
  const navigation = useNavigation();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for UI preview
  const mockWithdrawals = [
    { id: "1", userName: "John Doe", amount: 1500, status: "pending" },
    { id: "2", userName: "Jane Smith", amount: 2500, status: "pending" },
    { id: "3", userName: "Alex Johnson", amount: 1200, status: "pending" },
  ];

  useEffect(() => {
    setTimeout(() => {
      setWithdrawals(mockWithdrawals);
      setLoading(false);
    }, 800);
  }, []);

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
              .then(() => {
                navigation.replace("AdminLogin"); // redirect to Login screen
              })
              .catch((error) => {
                Alert.alert("Error", error.message);
              });
          }
        }
      ]
    );
  };

  const renderWithdrawal = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.name}>{item.userName}</Text>
        <Text>Amount: ₱{item.amount}</Text>
        <Text>Status: {item.status}</Text>
      </View>
      <View style={styles.cardRight}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: 'green' }]}>
          <Text style={styles.actionText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.danger }]}>
          <Text style={styles.actionText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primary} />;

  return (
    <View style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Withdrawals</Text>
          <Text style={styles.heroSubtitle}>Manage all pending withdrawal requests</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={withdrawals}
        keyExtractor={(item) => item.id}
        renderItem={renderWithdrawal}
        contentContainerStyle={{ paddingTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  // Hero Section
  hero: {
    height: 160,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  heroText: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: 25, fontWeight: '900' },
  heroSubtitle: { fontSize: 16, fontWeight: '600', color: '#f0f0f0', marginTop: 6 },
  logoutButton: { marginLeft: 10, padding: 8 },

  // Withdrawal Cards
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLeft: { flex: 1 },
  cardRight: { justifyContent: "space-between", height: 80 },
  name: { fontSize: 16, fontWeight: "700", color: "#2C3E50", marginBottom: 4 },
  actionButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, marginBottom: 6, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "700" },
});
