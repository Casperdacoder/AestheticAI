import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Input, Button, colors, Toast } from '../components/UI';
import { auth, db } from '../services/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

export default function ProfileEditScreen({ navigation }) {
  const user = auth.currentUser;
  const [firstName, setFirstName] = useState(user?.displayName || '');
  const [saved, setSaved] = useState(false);

  const save = async () => {
    try {
      await updateProfile(user, { displayName:firstName });
      await updateDoc(doc(db, 'users', user.uid), { name:firstName });
      setSaved(true);
      setTimeout(()=>setSaved(false), 1500);
    } catch (e) { Alert.alert('Error', e.message); }
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Toast visible={saved} text="Updated successfully!" onClose={()=>setSaved(false)} />
      <Text style={{ color: colors.teal, fontSize:22, fontWeight:'800', marginBottom:12 }}>Personal Information</Text>
      <Input placeholder="First Name" value={firstName} onChangeText={setFirstName}/>
      <Input placeholder="Email" value={user?.email || ''} editable={false}/>
      <Button title="Update" onPress={save}/>
    </View>
  );
}
