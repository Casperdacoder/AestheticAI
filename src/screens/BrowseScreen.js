import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BrowseScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Browse Users</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20, fontWeight: '600' }
});
