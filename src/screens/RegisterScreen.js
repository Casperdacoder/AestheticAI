import React, { useState } from 'react';
import { View, Text, Switch, Alert, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Screen, Input, Button, colors } from '../components/UI';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { auth } from '../services/firebase';
import { cacheUserRole } from '../services/userCache';
import { saveProfile } from '../services/profileStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ route, navigation }) {
  const role = route?.params?.role || 'user';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agree, setAgree] = useState(false);

  const sanitizeEmail = (value) => value?.replace(/\s+/g, '') ?? '';

  const getFriendlyErrorMessage = (error) => {
    const code = error?.code;
    switch (code) {
      case 'auth/email-already-in-use':
        return 'That email is already registered. Try signing in instead.';
      case 'auth/invalid-email':
        return 'The email address looks invalid. Please double-check it.';
      case 'auth/weak-password':
        return 'Password is too weak. Please choose one with at least 6 characters.';
      case 'permission-denied':
      case 'permission-denied/forbidden':
        return 'You do not have permission to complete this action. Please contact support.';
      default:
        return error?.message ?? 'Unable to create your account. Please try again.';
    }
  };

  const validate = () => {
    if (!name.trim()) {
      Alert.alert('Registration', 'Please enter your name.');
      return false;
    }
    const normalizedEmail = sanitizeEmail(email);
    if (normalizedEmail !== email) {
      setEmail(normalizedEmail);
    }
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      Alert.alert('Registration', 'Please enter a valid email address.');
      return false;
    }
    if (pass.length < 6) {
      Alert.alert('Registration', 'Password must be at least 6 characters.');
      return false;
    }
    if (pass !== confirm) {
      Alert.alert('Registration', "Passwords don't match.");
      return false;
    }
    if (!agree) {
      Alert.alert('Terms', 'Please agree to the Terms & Conditions');
      return false;
    }
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
      await updateProfile(credential.user, { displayName: name });

      const profile = {
        uid: credential.user.uid,
        name,
        email: normalizedEmail,
        role,
        subscription_type: 'Free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      let saveError = null;
      try {
        await saveProfile(credential.user.uid, profile, role);
      } catch (error) {
        saveError = error;
        if (error?.code !== 'unavailable') {
          throw error;
        }
      }

      await cacheUserRole(credential.user.uid, role);

      if (saveError?.code === 'unavailable') {
        Alert.alert(
          'Limited Connectivity',
          'Account created, but profile sync will resume once you are back online.'
        );
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'UserTabs' }],
      });
    } catch (error) {
      if (error?.code === 'auth/email-already-in-use') {
        Alert.alert(
          'Account Exists',
          'That email is already registered. Would you like to sign in instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login', { role })
            }
          ]
        );
        return;
      }

      console.warn('Register error', error);
      Alert.alert('Register Error', getFriendlyErrorMessage(error));
    }
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join us today! Create your account to get started</Text>

        <Input
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <Input
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <Input
          placeholder="Password"
          secureTextEntry
          value={pass}
          onChangeText={setPass}
          style={styles.input}
        />
        <Input
          placeholder="Confirm Password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          style={styles.input}
        />

        <View style={styles.agreementRow}>
          <Switch
            value={agree}
            onValueChange={setAgree}
            trackColor={{ false: colors.outline, true: colors.primary }}
            thumbColor={agree ? colors.primaryText : '#E5E7EB'}
          />
          <Text style={styles.agreementText}>I agree to the Terms & Conditions</Text>
        </View>

        <Button title="Register" onPress={register} />

        <TouchableOpacity onPress={() => navigation.navigate('Login', { role })} style={styles.footerLink}>
          <Text style={styles.footer}>Have an account? Login</Text>
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
    marginStart: 12,
    fontSize: 29,
    fontWeight: '900',
    fontFamily: 'serif',
    marginTop: 70,
    textAlign: 'start',
    marginBottom: 3,
  },
  subtitle: {
    color: '#0F3E48',
    marginStart: 12,
    fontSize: 15,
    fontFamily: 'serif',
    marginBottom: 32,
    opacity: 0.8,
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
