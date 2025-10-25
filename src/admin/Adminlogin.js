// src/screens/AdminLogin.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen, Input, Button, colors } from '../components/UI';
import { signInWithEmailAndPassword, getIdTokenResult } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function AdminLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = credential.user;

      // Get Firebase ID token to check admin claim
      const tokenResult = await getIdTokenResult(user);

      if (tokenResult.claims.admin) {
        Alert.alert('Welcome Admin', 'Login successful!');
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminTabs' }], // Navigate to admin tab navigator
        });
      } else {
        Alert.alert('Access Denied', 'You do not have admin privileges.');
        await auth.signOut(); // Sign out unauthorized users
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Login Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Admin Login</Text>
        <Text style={styles.subtitle}>Enter your admin credentials</Text>
        <Input
          placeholder="Admin Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
        ) : (
          <Button title="Login" onPress={login} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: colors.background, fontSize: 15, marginTop: 80, marginBottom: 100, margin: 10 },
  content: { flex: 1, padding: 10 },
  title: { color: colors.subtleText, fontSize: 30, fontWeight: '900', marginBottom: 3, marginHorizontal: 10 },
  subtitle: { color: colors.subtleText, fontSize: 15, opacity: 0.8, marginBottom: 32, marginHorizontal: 10 },
});
