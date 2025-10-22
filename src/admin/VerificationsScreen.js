// src/admin/screens/VerificationsScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { colors } from '../components/UI'; // ensure colors.primary exists
import { Ionicons } from '@expo/vector-icons';
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";

export default function VerificationsScreen() {
  const navigation = useNavigation();
  const [verifications, setVerifications] = useState([]);

  // Mock data (for preview, replace with database fetch later)
  const mockData = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      education: "BS Computer Science",
      experience: "3 years",
      specialization: "Web Development",
      location: "Manila",
      schedule: "Mon-Fri, 9AM-5PM",
      portfolio: "www.johndoe.com/portfolio.pdf",
      status: "pending",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      education: "MBA",
      experience: "5 years",
      specialization: "Business Consulting",
      location: "Cebu",
      schedule: "Tue-Thu, 10AM-4PM",
      portfolio: "www.janesmith.com/portfolio.pdf",
      status: "pending",
    },
  ];

  useEffect(() => {
    // TODO: replace mockData with database fetch
    setVerifications(mockData);
  }, []);

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
    <ScrollView style={screenStyles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      
      {/* Hero Section */}
      <View style={screenStyles.hero}>
        <View style={screenStyles.heroText}>
          <Text style={screenStyles.heroTitle}>Verifications</Text>
          <Text style={screenStyles.heroSubtitle}>Manage all pending consultant accounts</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={screenStyles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Cards */}
      <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
        {verifications.map(item => (
          <View key={item.id} style={screenStyles.card}>
            
            {/* Left Side: Name & Email */}
            <View style={screenStyles.cardLeft}>
              <Text style={screenStyles.name}>{item.name}</Text>
              <Text style={screenStyles.label}>
                Email: <Text style={screenStyles.value}>{item.email}</Text>
              </Text>
            </View>

            {/* Right Side: View All Button */}
            <TouchableOpacity
              style={screenStyles.viewButton}
              onPress={() => navigation.navigate("VerificationDetail", { data: item })}
              activeOpacity={0.8}
            >
              <Text style={screenStyles.viewButtonText}>View All</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const screenStyles = StyleSheet.create({
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
    flexDirection: 'row', // text + logout button in row
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  heroText: { flex: 1 },
  heroTitle: { color: '#fff', fontSize: 25, fontWeight: '900' },
  heroSubtitle: { fontSize: 16, fontWeight: '600', color: '#f0f0f0', marginTop: 6 },
  logoutButton: { marginLeft: 10, padding: 8 },

  // Card
  card: {
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
  cardLeft: {
    flex: 1,            // left side takes remaining space
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
  },
  label: {
    fontWeight: '600',
    marginTop: 4,
  },
  value: {
    fontWeight: '400',
  },
  // View All Button
  viewButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
