import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Screen, Button, colors, Toast } from '../components/UI';

const QR_PLACEHOLDER = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=AestheticAI';

export default function PaymentScreen() {
  const [ok, setOk] = useState(false);

  const pay = () => {
    setOk(true);
    setTimeout(() => setOk(false), 1600);
  };

  return (
    <Screen style={styles.screen}>
      <Toast visible={ok} text="Pay successfully!" onClose={() => setOk(false)} variant="success" />
      <Text style={styles.heading}>Pay with GCash</Text>
      <View style={styles.details}>
        <Text style={styles.label}>Plan</Text>
        <Text style={styles.value}>Yearly / Monthly</Text>
      </View>
      <Text style={styles.qrLabel}>Scan this QR CODE</Text>
      <View style={styles.qrContainer}>
        <Image source={{ uri: QR_PLACEHOLDER }} style={styles.qr} />
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaLine}>N****N P.</Text>
        <Text style={styles.metaLine}>Mobile No: +63 912 345 ....</Text>
      </View>
      <Button title="Confirm Payment" onPress={pay} style={styles.action} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 56,
    alignItems: 'center'
  },
  heading: {
    color: colors.subtleText,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24
  },
  details: {
    alignItems: 'center',
    marginBottom: 16
  },
  label: {
    color: colors.mutedAlt,
    fontSize: 14,
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  value: {
    color: colors.subtleText,
    fontWeight: '600'
  },
  qrLabel: {
    color: colors.subtleText,
    marginBottom: 12
  },
  qrContainer: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.outline
  },
  qr: {
    width: 220,
    height: 220,
    borderRadius: 12
  },
  meta: {
    marginTop: 24,
    alignItems: 'center'
  },
  metaLine: {
    color: colors.subtleText,
    fontSize: 16
  },
  action: {
    marginTop: 36,
    alignSelf: 'stretch'
  }
});
