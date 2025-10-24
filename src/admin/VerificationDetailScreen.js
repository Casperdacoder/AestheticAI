// src/admin/VerificationDetailScreen.js
import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Linking, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { db } from "../services/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { colors } from "../components/UI";

export default function VerificationDetailScreen({ route, navigation }) {
  const { data } = route.params;
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "consultants", data.id), { status: "verified" });
      Alert.alert("Approved", `${data.fullName} has been approved.`);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    Alert.alert(
      "Reject Consultant",
      "Are you sure you want to reject this consultant?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteDoc(doc(db, "consultants", data.id));
              Alert.alert("Rejected", `${data.fullName} has been removed.`);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleViewPortfolio = () => {
    if (data.portfolio) {
      Linking.openURL(data.portfolio);
    } else {
      Alert.alert("Portfolio not available");
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>{data.fullName ?? "N/A"}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{data.email ?? "N/A"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Education:</Text>
          <Text style={styles.value}>
            {data.education?.degree ?? "N/A"} ({data.education?.school ?? "N/A"})
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Experience:</Text>
          <Text style={styles.value}>
            {data.experience?.years ?? "N/A"} years ({data.experience?.specialization ?? "N/A"})
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{data.provinceCity ?? "N/A"}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Country:</Text>
          <Text style={styles.value}>{data.country ?? "N/A"}</Text>
        </View>

        <TouchableOpacity style={styles.portfolioButton} onPress={handleViewPortfolio}>
          <Text style={styles.portfolioButtonText}>View Portfolio</Text>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "green" }]} onPress={handleApprove}>
            <Text style={styles.actionText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: "red" }]} onPress={handleReject}>
            <Text style={styles.actionText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, color: "#2C3E50" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: { fontWeight: "600", fontSize: 16, color: "#34495E", marginBottom: 4 },
  value: { fontWeight: "400", fontSize: 15, color: "#2C3E50" },
  portfolioButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 15,
  },
  portfolioButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  actionButton: { flex: 0.48, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
