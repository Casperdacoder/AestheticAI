import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Input, Button, colors } from '../components/UI';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const reset = async () => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Reset link sent', 'Check your email for instructions');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={{ flex:1, padding:22 }}>
      <Text style={{ color: colors.teal, fontSize:26, fontWeight:'800', marginBottom:12 }}>Forgot Password</Text>
      <Text style={{ marginBottom:10 }}>Enter your email and we'll send a reset link</Text>
      <Input placeholder="Enter your Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Button title="Send Reset Link" onPress={reset} />
    </View>
  );
}
