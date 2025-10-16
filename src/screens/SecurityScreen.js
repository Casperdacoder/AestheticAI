import React, { useState } from 'react';
import { Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Screen, Input, Button, Toast, colors } from '../components/UI';
import { auth } from '../services/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

export default function SecurityScreen({ navigation }) {
  const user = auth.currentUser;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const changePassword = async () => {
    if (!user?.email) {
      Alert.alert('Not signed in', 'Please sign in again.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }

    try {
      setSaving(true);
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSaved(true);
      setTimeout(() => setSaved(false), 1600);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      Alert.alert('Change Password', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <Toast visible={saved} text="Password updated successfully!" onClose={() => setSaved(false)} />
      <TouchableOpacity onPress={() => navigation?.goBack?.()} activeOpacity={0.6}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Change Password</Text>
      <Input
        placeholder="Current Password"
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <Input placeholder="New Password" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
      <Input
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Save Password" onPress={changePassword} disabled={saving} />
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
    marginBottom: 24
  },
  title: {
    color: colors.subtleText,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24
  }
});
