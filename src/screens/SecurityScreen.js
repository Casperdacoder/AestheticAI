import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Input, Button, colors } from '../components/UI';
import { auth } from '../services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function SecurityScreen() {
  const [email, setEmail] = useState(auth.currentUser?.email || '');

  const change = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Check your email', 'We sent a password reset link.');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ color: colors.teal, fontSize:22, fontWeight:'800', marginBottom:10 }}>Change Password</Text>
      <Input value={email} onChangeText={setEmail}/>
      <Button title="Save Password" onPress={change}/>
    </View>
  );
}
