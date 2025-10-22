// src/admin/screens/UserManagementScreenPreview.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Card, Button, colors } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useNavigation } from '@react-navigation/native';

export default function AccountsScreen() {
  const navigation = useNavigation();

  // Mock users data
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', active: true },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', active: false },
    { id: '3', name: 'Alex Johnson', email: 'alex@example.com', active: true },
  ]);

  // Toggle user status
  const toggleUserStatus = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const newStatus = !user.active;
    Alert.alert(
      newStatus ? 'Activate Account' : 'Deactivate Account',
      `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} ${user.name}'s account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newStatus ? 'Activate' : 'Deactivate',
          style: 'destructive',
          onPress: () => {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: newStatus } : u));
          }
        }
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
              title={user.active ? 'Deactivate' : 'Activate'}
              variant={user.active ? 'solid' : 'primary'}
              style={user.active ? styles.deactivateButton : styles.activateButton}
              textStyle={user.active ? styles.deactivateButtonText : {}}
              onPress={() => toggleUserStatus(user.id)}
            />
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },

  // Hero Section
  hero: {
    height: 160,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row', // Text + logout button
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
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

  // Users
  userCard: {
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#fff',
    borderColor: 0,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  userInfo: {},
  userName: { fontSize: 16, fontWeight: '700', color: '#2C3E50' },
  userEmail: { fontSize: 14, color: '#7F8C8D', marginTop: 2 },

  // Buttons
  deactivateButton: {
    backgroundColor: colors.danger,
    borderColor: colors.danger,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  deactivateButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  activateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
});
