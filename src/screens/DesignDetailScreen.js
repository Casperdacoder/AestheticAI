import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Modal } from 'react-native';
import { Screen, Button, colors } from '../components/UI';

const palette = ['#f0efe9', '#d6ccc2', '#adb5bd', '#84a59d'];

export default function DesignDetailScreen({ route, navigation }) {
  const img = route?.params?.uploadedUri || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=60';
  const title = route?.params?.title || 'Design 1';
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!downloading) return;

    const timer = setInterval(() => {
      setProgress((current) => {
        const nextValue = Math.min(current + 14, 100);
        if (nextValue >= 100) {
          clearInterval(timer);
          setTimeout(() => setDownloading(false), 600);
        }
        return nextValue;
      });
    }, 220);

    return () => clearInterval(timer);
  }, [downloading]);

  return (
    <Screen style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      <Image source={{ uri: img }} style={styles.image} />

      <View style={styles.actionsRow}>
        <Button title="View in 2D" variant="outline" style={styles.secondaryAction} />
        <Button title="View in 3D" variant="outline" style={styles.secondaryAction} />
      </View>

      <Text style={styles.sectionTitle}>Design Details</Text>
      <Text style={styles.detailText}>Style: Modern Living Room</Text>
      <Text style={styles.detailText}>Room Size: 4m x 5m</Text>

      <Text style={styles.sectionTitle}>Color Palette</Text>
      <View style={styles.paletteRow}>
        {palette.map((color) => (
          <View key={color} style={[styles.swatch, { backgroundColor: color }]} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>AI Tips</Text>
      <View style={styles.tipList}>
        <Text style={styles.tip}>- Use lighter curtains</Text>
        <Text style={styles.tip}>- Add greenery near the window</Text>
      </View>

      <View style={styles.footerActions}>
        <Button
          title="Customize"
          variant="outline"
          style={styles.customize}
          onPress={() => navigation.navigate('CustomizeAI')}
        />
        <Button
          title="Export"
          onPress={() => {
            setProgress(0);
            setDownloading(true);
          }}
        />
      </View>

      <Modal transparent visible={downloading} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.progressRing}>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
            <Text style={styles.modalLabel}>Downloading........</Text>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 56
  },
  title: {
    color: colors.subtleText,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    marginBottom: 20
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24
  },
  secondaryAction: {
    flex: 1,
    borderColor: colors.primary,
    borderWidth: 1.5
  },
  sectionTitle: {
    color: colors.subtleText,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16
  },
  detailText: {
    color: colors.subtleText,
    marginTop: 6
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.outline
  },
  tipList: {
    marginTop: 10,
    gap: 8
  },
  tip: {
    color: colors.subtleText
  },
  footerActions: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 36,
    flexDirection: 'row',
    gap: 16
  },
  customize: {
    flex: 1,
    borderColor: colors.primary,
    borderWidth: 1.5
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCard: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outline
  },
  progressRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 6,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  progressText: {
    color: colors.subtleText,
    fontWeight: '700',
    fontSize: 20
  },
  modalLabel: {
    color: colors.subtleText,
    fontWeight: '600'
  }
});
