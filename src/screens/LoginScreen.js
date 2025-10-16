import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Input, Button, colors } from '../components/UI';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { cacheUserRole, getCachedUserRole } from '../services/userCache';
import { loadProfile } from '../services/profileStore';

export default function LoginScreen({ route, navigation }) {
  const initialRole = route?.params?.role || 'user';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const resolveRole = async (uid) => {
    const cached = await getCachedUserRole(uid);
    if (cached) return cached;
    const profile = await loadProfile(uid);
    if (profile?.role) {
      await cacheUserRole(uid, profile.role);
      return profile.role;
    }
    return initialRole;
  };

  const login = async () => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const role = await resolveRole(credential.user.uid);
      navigation.reset({
        index: 0,
        routes: [{ name: role === 'designer' ? 'DesignerTabs' : 'UserTabs' }]
      });
    } catch (error) {
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <Screen style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome Back</Text>
        <Input
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Forgot')} style={styles.linkWrapper}>
          <Text style={styles.link}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button title="Login" onPress={login} />

        <TouchableOpacity onPress={() => navigation.navigate('Register', { role: initialRole })} style={styles.footerLink}>
          <Text style={styles.footer}>New here? Create an Account</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 56
  },
  back: {
    color: colors.mutedAlt,
    fontSize: 16,
    marginBottom: 32
  },
  content: {
    flex: 1
  },
  title: {
    color: colors.subtleText,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 32
  },
  linkWrapper: {
    alignItems: 'flex-end',
    marginBottom: 18
  },
  link: {
    color: colors.accent,
    fontWeight: '600'
  },
  footerLink: {
    marginTop: 24
  },
  footer: {
    textAlign: 'center',
    color: colors.subtleText,
    fontWeight: '600'
  }
});
