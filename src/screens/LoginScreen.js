import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Input, Button, colors } from '../components/UI';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function LoginScreen({ route, navigation }) {
  const role = route?.params?.role || 'user';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.reset({ index:0, routes:[{ name:'MainTabs' }] });
    } catch (e) {
      Alert.alert('Login Error', e.message);
    }
  };

  return (
    <View style={{ flex:1, padding:22 }}>
      <Text style={{ color: colors.teal, fontSize:28, fontWeight:'800', marginBottom:12 }}>Welcome Back</Text>
      <Input placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}/>
      <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/>
      <TouchableOpacity onPress={()=>navigation.navigate('Forgot')}><Text style={{ color: colors.teal, marginBottom:16 }}>Forgot Password?</Text></TouchableOpacity>
      <Button title="Login" onPress={login}/>
      <TouchableOpacity onPress={()=>navigation.navigate('Register', { role })} style={{ marginTop:16 }}>
        <Text style={{ textAlign:'center', color: colors.teal }}>New here? Create an Account</Text>
      </TouchableOpacity>
    </View>
  );
}
