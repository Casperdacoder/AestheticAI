import React from 'react';
import { Image, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../components/UI';

export default function VideoCallScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=60' }}
        style={styles.feed}
      />
      <View style={styles.selfPreview} />
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="videocam-outline" size={22} color={colors.primaryText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="camera-outline" size={22} color={colors.primaryText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton}>
          <Ionicons name="mic-outline" size={22} color={colors.primaryText} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlButton, styles.endCall]} onPress={() => navigation.goBack()}>
          <Ionicons name="call" size={22} color={colors.primaryText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000'
  },
  feed: {
    width: '100%',
    height: '100%'
  },
  selfPreview: {
    position: 'absolute',
    right: 24,
    top: 48,
    width: 110,
    height: 160,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderWidth: 1,
    borderColor: colors.outline
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderWidth: 1,
    borderColor: colors.outline
  },
  endCall: {
    backgroundColor: colors.danger,
    borderColor: colors.danger
  }
});
