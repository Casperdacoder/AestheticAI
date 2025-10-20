import React, { useState } from 'react';
import { Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen, Input, Button, colors } from '../components/UI';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const reset = async () => {
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Reset link sent', 'Check your email for instructions');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <Screen style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.subtitle}>Enter your email and we'll send a reset link</Text>
      <Input
        placeholder="Enter your Email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (error) setError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={error}
      />
      <Button title="Send Reset Link" onPress={reset} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    color: colors.subtleText,
    fontSize: 28,
    fontSize: 16,
    marginBottom: 100,
    margin: 10,
  },
  title: {
    color: colors.subtleText,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
    fontFamily: 'serif',
     marginLeft: 10,
    marginRight: 10,
  },
  subtitle: {
    color: colors.subtleText,
    fontSize: 15,
     fontFamily: 'serif',
    marginBottom: 24,
    lineHeight: 22,
     marginLeft: 10,
    marginRight: 10,
  }
});
