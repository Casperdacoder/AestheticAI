import React, { useState } from 'react';
import { View, Text, Switch, Alert, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Screen, Input, Button, colors } from '../components/UI';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
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

  const validate = () => {
    if (!name.trim()) {
      Alert.alert('Registration', 'Please enter your name.');
      return false;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
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
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      await updateProfile(credential.user, { displayName: name });

      const profile = {
        name,
        email: email.trim(),
        role,
        createdAt: new Date().toISOString()
      };

      await saveProfile(credential.user.uid, profile);
      await cacheUserRole(credential.user.uid, role);

      navigation.reset({
        index: 0,
        routes: [{ name: role === 'designer' ? 'DesignerTabs' : 'UserTabs' }]
      });
    } catch (error) {
      Alert.alert('Register Error', error.message);
    }
  };

  return (
    <Screen style={styles.screen}>
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create your account</Text>
        <Input placeholder="Name" value={name} onChangeText={setName} />
        <Input
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Input placeholder="Password" secureTextEntry value={pass} onChangeText={setPass} />
        <Input placeholder="Confirm Password" secureTextEntry value={confirm} onChangeText={setConfirm} />

        <View style={styles.agreementRow}>
          <Switch
            value={agree}
            onValueChange={setAgree}
            trackColor={{ false: colors.outline, true: colors.primary }}
            thumbColor={agree ? colors.primaryText : '#E5E7EB'}
          />
          <Text style={styles.agreementText}>
            I agree to <Text style={styles.agreementHighlight}>the Terms & Conditions</Text>
          </Text>
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
    paddingTop: 56
  },
  back: {
    color: colors.mutedAlt,
    fontSize: 16,
    marginBottom: 16
  },
  scroll: {
    paddingBottom: 40
  },
  title: {
    color: colors.subtleText,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 24
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32
  },
  agreementText: {
    color: colors.subtleText,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20
  },
  agreementHighlight: {
    color: colors.accent,
    fontWeight: '700'
  },
  footerLink: {
    marginTop: 24
  },
  footer: {
    textAlign: 'center',
    color: colors.subtleText,
    fontWeight: '600'
  }
});
