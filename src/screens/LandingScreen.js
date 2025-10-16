import React from 'react';
import { ImageBackground, StatusBar, View, Text, StyleSheet } from 'react-native';
import { Button, colors } from '../components/UI';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80&auto=format&fit=crop';

export default function LandingScreen({ navigation }) {
  return (
    <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.background} imageStyle={styles.image}>
      <StatusBar barStyle="light-content" />
      <View style={styles.scrim}>
        <View style={styles.card}>
          <Text style={styles.tagline}>Your dream space starts here</Text>
          <Text style={styles.title}>Aesthetic AI</Text>
          <Text style={styles.subtitle}>How do you plan to use the app?</Text>
          <Text style={styles.helper}>LOGIN AS</Text>
          <Button title="User" onPress={() => navigation.navigate('Login', { role: 'user' })} style={styles.primaryCta} />
          <Button
            title="Designer"
            onPress={() => navigation.navigate('Login', { role: 'designer' })}
            variant="outline"
            style={styles.secondaryCta}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1
  },
  image: {
    opacity: 0.85
  },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 10, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  card: {
    backgroundColor: 'rgba(5, 10, 10, 0.72)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 40,
    borderWidth: 1,
    borderColor: colors.outline
  },
  tagline: {
    textAlign: 'center',
    color: colors.subtleText,
    fontSize: 16,
    letterSpacing: 0.6,
    marginBottom: 6
  },
  title: {
    textAlign: 'center',
    color: colors.primaryText,
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: 1
  },
  subtitle: {
    textAlign: 'center',
    color: colors.subtleText,
    fontSize: 16,
    marginTop: 28
  },
  helper: {
    textAlign: 'center',
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 4,
    marginTop: 24,
    marginBottom: 16
  },
  primaryCta: {
    marginTop: 12
  },
  secondaryCta: {
    marginTop: 14
  }
});
