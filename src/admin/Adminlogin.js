import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Input, Button, colors } from '../components/UI';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function AdminLogin({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const ADMIN_EMAIL = 'admin@gmail.com';

  const login = async () => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = credential.user;

      if (user.email === ADMIN_EMAIL) {
        Alert.alert('Welcome Admin', 'Login successful!');
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminTabs' }], // ✅ Go to Admin Tab navigator
        });
      } else {
        Alert.alert('Access Denied', 'You are not authorized as an admin.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Login Error', error.message);
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
        <Input placeholder="Admin Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Login" onPress={login} />
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
