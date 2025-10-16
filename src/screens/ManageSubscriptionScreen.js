import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { Screen, Button, colors, Toast } from '../components/UI';

const BENEFITS = [
  'Unlimited AI layout suggestions',
  'Multi-room analysis',
  'Custom color palettes',
  '3D visualizations',
  'Expert décor tips',
  'Personalized design advice',
  'Unlimited saved projects',
  'Smart furniture recommendations',
  'Priority support',
  'Learns your style over time'
];

export default function ManageSubscriptionScreen() {
  const [cancelled, setCancelled] = useState(false);

  const confirmCancellation = () => {
    Alert.alert('Cancel Subscription', 'If you cancel, you will lose premium features after the billing period.', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          setCancelled(true);
          setTimeout(() => setCancelled(false), 2000);
        }
      }
    ]);
  };

  return (
    <Screen style={styles.screen}>
      <Toast
        visible={cancelled}
        text="Your subscription has been successfully cancelled."
        onClose={() => setCancelled(false)}
        variant="danger"
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Manage Subscription</Text>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Plan:</Text>
          <Text style={styles.metaValue}>Premium</Text>
          <Text style={styles.metaLabel}>Renew on:</Text>
          <Text style={styles.metaValue}>Date</Text>
          <Text style={styles.metaLabel}>Status:</Text>
          <Text style={styles.metaValue}>Active</Text>
        </View>

        <Text style={styles.sectionTitle}>Current Plan:</Text>
        <View style={styles.list}>
          {BENEFITS.map((item) => (
            <Text key={item} style={styles.listItem}>- {item}</Text>
          ))}
        </View>

        <Button
          title="Cancel Subscription"
          onPress={confirmCancellation}
          variant="outline"
          style={styles.cancelButton}
          textStyle={styles.cancelText}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 56
  },
  scroll: {
    paddingBottom: 40
  },
  heading: {
    color: colors.subtleText,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24
  },
  metaBlock: {
    gap: 4,
    marginBottom: 24
  },
  metaLabel: {
    color: colors.mutedAlt,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12
  },
  metaValue: {
    color: colors.subtleText,
    fontWeight: '600'
  },
  sectionTitle: {
    color: colors.subtleText,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12
  },
  list: {
    gap: 8
  },
  listItem: {
    color: colors.subtleText,
    lineHeight: 22
  },
  cancelButton: {
    marginTop: 32,
    borderColor: colors.danger,
    borderWidth: 1.5,
    backgroundColor: 'rgba(210,74,67,0.08)'
  },
  cancelText: {
    color: colors.danger
  }
});
