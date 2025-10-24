import React, { useState } from 'react';
import { View, Text, Switch, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen, Input, Button, colors } from '../components/UI';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { cacheUserRole } from '../services/userCache';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterConScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [provinceCity, setProvinceCity] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const validate = () => {
    if (!fullName.trim()) { Alert.alert('Registration', 'Enter your full name'); return false; }
    if (!provinceCity.trim()) { Alert.alert('Registration', 'Enter your province/city'); return false; }
    if (!country.trim()) { Alert.alert('Registration', 'Enter your country'); return false; }
    if (!EMAIL_REGEX.test(email.trim())) { Alert.alert('Registration', 'Enter a valid email'); return false; }
    if (pass.length < 6) { Alert.alert('Registration', 'Password must be at least 6 characters'); return false; }
    if (pass !== confirm) { Alert.alert('Registration', "Passwords don't match"); return false; }
    if (!agree) { Alert.alert('Terms', 'Please agree to Terms & Conditions'); return false; }
    return true;
  };

  const register = async () => {
    if (!validate()) return;

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(credential.user, { displayName: fullName });

      const profile = {
        fullName,
        provinceCity,
        country,
        email: email.trim(),
        role: 'consultant',
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'consultants', credential.user.uid), profile);
      await cacheUserRole(credential.user.uid, 'consultant');

      navigation.navigate('VerificationForm', { uid: credential.user.uid });

    } catch (error) {
      Alert.alert('Register Error', error.message);
    }
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Step 1 - Consultant Registration</Text>
        <Text style={styles.subtitle}>Fill in your details to continue</Text>

        <Input placeholder="Full Name" value={fullName} onChangeText={setFullName} style={styles.input} />
        <Input placeholder="Province/City" value={provinceCity} onChangeText={setProvinceCity} style={styles.input} />
        <Input placeholder="Country" value={country} onChangeText={setCountry} style={styles.input} />
        <Input placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} style={styles.input} />
        <Input placeholder="Password" secureTextEntry value={pass} onChangeText={setPass} style={styles.input} />
        <Input placeholder="Confirm Password" secureTextEntry value={confirm} onChangeText={setConfirm} style={styles.input} />

        <View style={styles.agreementRow}>
          <Switch
            value={agree}
            onValueChange={setAgree}
            trackColor={{ false: colors.outline, true: colors.primary }}
            thumbColor={agree ? colors.primaryText : '#E5E7EB'}
          />
          <Text style={styles.agreementText}>I agree to the Terms & Conditions</Text>
        </View>

        <Button title="Continue" onPress={register} style={styles.button} />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
          <Text style={styles.footer}>Already have an account? Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E9E8E8',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  scroll: {
    paddingBottom: 40,
  },
  title: {
    color: '#0F3E48',
    fontSize: 29,
    fontWeight: '900',
    fontFamily: 'serif',
    marginTop: 30,
    marginStart: 12,
    marginBottom: 3,
  },
  subtitle: {
    color: '#0F3E48',
    fontSize: 15,
    fontFamily: 'serif',
    marginStart: 12,
    marginBottom: 32,
    opacity: 0.8,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  agreementText: {
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
    fontFamily: 'serif',
  },
  button: {
    marginBottom: 30,
  },

  footer: {
    textAlign: 'center',
    color: '#0F3E48',
    fontWeight: '400',
    fontSize: 15,
    fontFamily: 'serif',
  },
});
