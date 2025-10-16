import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, StatusBar } from 'react-native';
import { Screen, Input, Button, Toast, colors } from '../components/UI';
import { auth, db } from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

export default function ProfileEditScreen({ navigation }) {
  const user = auth.currentUser;
  const [firstName, setFirstName] = useState(user?.displayName || '');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    try {
      if (!user) throw new Error('No authenticated user found.');
      await updateProfile(user, { displayName: firstName });
      await updateDoc(doc(db, 'users', user.uid), { name: firstName });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <Screen inset={false} style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <Toast visible={saved} text="Updated successfully!" onClose={() => setSaved(false)} variant="success" />
      <View style={styles.hero}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>Back</Text>
      </View>

      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          <View style={styles.cameraRing}>
            <View style={styles.cameraIcon} />
          </View>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.heading}>Personal Information</Text>
        <Input label="First Name" value={firstName} onChangeText={setFirstName} />
        <Input label="Email" value={user?.email || ''} editable={false} style={styles.disabledInput} />
        <Button title="Update" onPress={save} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background
  },
  hero: {
    height: 160,
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingHorizontal: 24
  },
  back: {
    color: colors.primaryText,
    fontSize: 16
  },
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -50
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary
  },
  form: {
    marginTop: 36,
    paddingHorizontal: 28,
    gap: 16
  },
  heading: {
    color: colors.subtleText,
    fontSize: 22,
    fontWeight: '700'
  },
  disabledInput: {
    opacity: 0.7
  }
});
