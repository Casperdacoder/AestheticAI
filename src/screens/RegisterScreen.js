import React, { useState } from 'react';
import { View, Text, Switch, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Input, Button, colors } from '../components/UI';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

export default function RegisterScreen({ route, navigation }) {
  const role = route?.params?.role || 'user';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const register = async () => {
    try {
      if (!agree) return Alert.alert('Terms', 'Please agree to Privacy and Agreements');
      if (pass !== confirm) return Alert.alert('Password', 'Passwords do not match');
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, 'users', cred.user.uid), {
        name, email: email.trim(), role, createdAt: serverTimestamp()
      });
      navigation.reset({ index:0, routes:[{ name:'MainTabs' }] });
    } catch (e) {
      Alert.alert('Register Error', e.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding:22 }}>
      <Text style={{ color: colors.teal, fontSize:28, fontWeight:'800', marginBottom:12 }}>Create your account</Text>
      <Input placeholder="Name" value={name} onChangeText={setName}/>
      <Input placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail}/>
      <Input placeholder="Password" secureTextEntry value={pass} onChangeText={setPass}/>
      <Input placeholder="Confirm Password" secureTextEntry value={confirm} onChangeText={setConfirm}/>

      <View style={{ flexDirection:'row', alignItems:'center', marginBottom:12 }}>
        <Switch value={agree} onValueChange={setAgree} trackColor={{ false:'#93c5fd', true:'#114D52' }}/>
        <Text style={{ marginLeft:8 }}>I agree to <Text style={{ color: colors.teal, fontWeight:'700' }}>Privacy and Agreements</Text></Text>
      </View>

      <Button title="Register" onPress={register}/>
      <TouchableOpacity onPress={()=>navigation.navigate('Login', { role })} style={{ marginTop:16 }}>
        <Text style={{ textAlign:'center', color: colors.teal }}>Have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
