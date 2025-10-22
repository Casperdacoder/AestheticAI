// src/admin/screens/VerificationDetailScreenPreview.js
import React from "react";
import { View, Text, ScrollView, StyleSheet, Button, Alert, Linking } from "react-native";

export default function VerificationDetailScreen({ route }) {
  const { data } = route.params;

  const handleApprove = () => Alert.alert("Approve", `You approved ${data.name}`);
  const handleReject = () => Alert.alert("Reject", `You rejected ${data.name}`);
  const handleViewPortfolio = () => {
    // Open the portfolio link
    Linking.openURL(data.portfolio);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{data.name}</Text>
      <Text style={styles.label}>Email: <Text style={styles.value}>{data.email}</Text></Text>
      <Text style={styles.label}>Education: <Text style={styles.value}>{data.education}</Text></Text>
      <Text style={styles.label}>Experience: <Text style={styles.value}>{data.experience}</Text></Text>
      <Text style={styles.label}>Specialization: <Text style={styles.value}>{data.specialization}</Text></Text>
      <Text style={styles.label}>Location: <Text style={styles.value}>{data.location}</Text></Text>
      <Text style={styles.label}>Schedule: <Text style={styles.value}>{data.schedule}</Text></Text>
      <Button title="View Portfolio" color="#007AFF" onPress={handleViewPortfolio} />
      <View style={styles.actions}>
        <Button title="Accept" color="green" onPress={handleApprove} />
        <Button title="Reject" color="red" onPress={handleReject} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  label: { fontWeight: "600", marginTop: 8 },
  value: { fontWeight: "400" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
});
