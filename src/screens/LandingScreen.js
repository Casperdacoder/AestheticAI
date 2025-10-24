import React from 'react';
import { ImageBackground, StatusBar, View, Text, StyleSheet } from 'react-native';
import { Button, colors } from '../components/UI';

const HERO_IMAGE = require('../../assets/new_background.jpg');

export default function LandingScreen({ navigation }) {
  return (
    <ImageBackground source={HERO_IMAGE} style={styles.background} imageStyle={styles.image}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <View style={styles.overlay}>
        {/* Header Text */}
        <View style={styles.textContainer}>
          <Text style={styles.topText}>Welcome to</Text>
          <Text style={styles.brandName}>Aesthetic AI</Text>
          <Text
            style={styles.tagline}
            onLongPress={() => navigation.navigate('AdminLogin')}
          >
            Your dream space starts here
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subtitle}>Continue as</Text>

        {/* User Button */}
        <Button
          title="User"
          onPress={() => navigation.navigate('Login', { role: 'user' })}
          style={[styles.buttonBase, styles.userButton]}
          textStyle={styles.userButtonText}
        />

        {/* Consultant (Designer) Button */}
        <Button
          title="Consultant"
          onPress={() => navigation.navigate('Login', { role: 'consultant' })}
          style={[styles.buttonBase, styles.designerButton]}
          textStyle={styles.designerButtonText}
        />

        <Text style={styles.footerNote}>© 2025 Aesthetic AI. All rights reserved.</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  image: {
    resizeMode: 'cover',
    opacity: 0.88,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  topText: {
    color: colors.solid,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'serif',
    letterSpacing: 1,
    opacity: 0.9,
  },
  brandName: {
    color: colors.background,
    fontSize: 45,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 20,
    fontFamily: 'serif',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 5,
  },
  tagline: {
    color: colors.background,
    fontSize: 18,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.9,
    lineHeight: 22,
    marginTop: 0,
    fontFamily: 'serif',
  },
  divider: {
    width: 180,
    height: 3,
    backgroundColor: colors.background,
    borderRadius: 20,
    marginVertical: 30,
  },
  subtitle: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  buttonBase: {
    width: '80%',
    paddingVertical: 14,
    borderRadius: 12, 
    marginVertical: 8,
    elevation: 2,
  },
  userButton: {
    backgroundColor: colors.solid,
  },
  userButtonText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  designerButton: {
    backgroundColor: colors.subtleText,
    borderWidth: 1.5,
    borderColor: colors.subtleText,
  },
  designerButtonText: {
    color: colors.solid,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 1,
  },
  footerNote: {
    position: 'absolute',
    bottom: 25,
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
});
