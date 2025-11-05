import React, { useState } from 'react';
import { View, Text, Switch, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen, Input, Button, colors } from '../components/UI';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { auth } from '../services/firebase';
import { cacheUserRole } from '../services/userCache';
import { saveProfile } from '../services/profileStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterConScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [provinceCity, setProvinceCity] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const sanitizeEmail = (value) => value?.replace(/\s+/g, '') ?? '';

  const getFriendlyErrorMessage = (error) => {
    const code = error?.code;
    switch (code) {
      case 'auth/email-already-in-use':
        return 'That email already has an account. Please sign in or use a different email.';
      case 'auth/invalid-email':
        return 'The email address looks invalid. Please double-check it.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose one with at least 6 characters.';
      default:
        return error?.message ?? 'Unable to create your consultant account. Please try again.';
    }
  };

  const validate = () => {
    if (!fullName.trim()) { Alert.alert('Registration', 'Enter your full name'); return false; }
    if (!provinceCity.trim()) { Alert.alert('Registration', 'Enter your province/city'); return false; }
    if (!country.trim()) { Alert.alert('Registration', 'Enter your country'); return false; }
    const normalizedEmail = sanitizeEmail(email);
    if (normalizedEmail !== email) { setEmail(normalizedEmail); }
    if (!EMAIL_REGEX.test(normalizedEmail)) { Alert.alert('Registration', 'Enter a valid email'); return false; }
    if (pass.length < 6) { Alert.alert('Registration', 'Password must be at least 6 characters'); return false; }
    if (pass !== confirm) { Alert.alert('Registration', "Passwords don't match"); return false; }
    if (!agree) { Alert.alert('Terms', 'Please agree to Terms & Conditions'); return false; }
    return true;
  };

  const register = async () => {
    if (!validate()) return;

    try {
      const normalizedEmail = sanitizeEmail(email);
      if (normalizedEmail !== email) {
        setEmail(normalizedEmail);
      }

      const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, pass);
      await updateProfile(credential.user, { displayName: fullName });

      const profile = {
        uid: credential.user.uid,
        fullName,
        provinceCity,
        country,
        email: normalizedEmail,
        role: 'consultant',
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      let saveError = null;
      try {
        await saveProfile(credential.user.uid, profile, 'consultant');
      } catch (error) {
        saveError = error;
        if (error?.code !== 'unavailable') {
          throw error;
        }
      }

      await cacheUserRole(credential.user.uid, 'consultant');

      if (saveError?.code === 'unavailable') {
        Alert.alert(
          'Limited Connectivity',
          'Consultant account created, but profile details will finish syncing when you reconnect.'
        );
      }

      navigation.navigate('VerificationForm', { uid: credential.user.uid });
    } catch (error) {
      if (error?.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Account Exists',
          'That email already has a consultant account. Do you want to sign in instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login', { role: 'consultant' })
            }
          ]
        );
        return;
      }

      console.warn('Consultant register error', error);
      Alert.alert('Register Error', getFriendlyErrorMessage(error));
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

        <TouchableOpacity onPress={() => navigation.navigate('Login', { role: 'consultant' })} style={styles.footerLink}>
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
  footerLink: {
    marginTop: 24,
  },
  footer: {
    textAlign: 'center',
    color: '#0F3E48',
    fontWeight: '400',
    fontSize: 15,
    fontFamily: 'serif',
  },
});
