import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Screen, colors } from '../components/UI';

const DATA = [
  'Your consultant shared new recommendations for your living room update.',
  'Premium plan renewal confirmed. Enjoy uninterrupted access to AI tools.'
];

export default function NotificationsScreen() {
  return (
    <Screen style={styles.screen}>
      <Text style={styles.title}>Notifications</Text>
      {DATA.map((message, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.body}>{message}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 56,
    gap: 16
  },
  title: {
    color: colors.subtleText,
    fontSize: 24,
    fontWeight: '700'
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.outline
  },
  body: {
    color: colors.subtleText,
    lineHeight: 22
  }
});
