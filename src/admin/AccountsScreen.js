// src/admin/screens/AccountsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Button, colors } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function AccountsScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from Firestore
  useEffect(() => {
    const usersRef = collection(db, "users");

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(fetchedUsers);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Toggle user active status
  const toggleUserStatus = async (userId, currentStatus) => {
    const userRef = doc(db, "users", userId);
    const newStatus = !currentStatus;

    Alert.alert(
      newStatus ? "Activate Account" : "Deactivate Account",
      `Are you sure you want to ${newStatus ? "activate" : "deactivate"} this account?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: newStatus ? "Activate" : "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              await updateDoc(userRef, { active: newStatus });
            } catch (error) {
              console.error("Error updating user status: ", error);
              Alert.alert("Error", "Failed to update user status.");
            }
          },
        },
      ]
    );
  };

  // Logout handler
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>User Management</Text>
          <Text style={styles.heroSubtitle}>Manage all registered users</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        {users.map(user => (
          <Card key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <Button
              title={user.active ? "Deactivate" : "Activate"}
              variant={user.active ? "solid" : "primary"}
              style={user.active ? styles.deactivateButton : styles.activateButton}
              textStyle={user.active ? styles.deactivateButtonText : {}}
              onPress={() => toggleUserStatus(user.id, user.active)}
            />
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },

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

  userCard: {
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  userInfo: {},
  userName: { fontSize: 16, fontWeight: '700', color: '#2C3E50' },
  userEmail: { fontSize: 14, color: '#7F8C8D', marginTop: 2 },

  deactivateButton: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  deactivateButtonText: { color: '#fff', fontWeight: '700' },
  activateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
});
