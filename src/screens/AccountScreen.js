import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Button, colors } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

export default function AccountScreen({ navigation }) {
  const email = auth.currentUser?.email || 'example@gmail.com';

  return (
    <View style={{ flex:1 }}>
      <View style={{ backgroundColor: colors.teal, padding:18, paddingTop:50, alignItems:'center' }}>
        <View style={{ width:96, height:96, borderRadius:48, backgroundColor:'#e5e7eb' }} />
        <Text style={{ color:'#e5e7eb', marginTop:12, fontSize:16 }}>Name</Text>
        <Text style={{ color:'#cdd7df', textDecorationLine:'underline' }}>{email}</Text>
        <Button title="Edit" onPress={()=>navigation.navigate('ProfileEdit')} style={{ marginTop:8, paddingVertical:8, paddingHorizontal:24, backgroundColor:'#1a5b60' }}/>
      </View>

      <View style={{ padding:16, gap:16 }}>
        <TouchableOpacity onPress={()=>navigation.navigate('Security')}>
          <Text style={{ color: colors.teal }}>Change Password</Text>
        </TouchableOpacity>

        <View>
          <TouchableOpacity onPress={()=>navigation.navigate('ManageSubscription')} style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
            <Text style={{ color: colors.teal }}>Subscription</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.teal}/>
          </TouchableOpacity>
          <Text style={{ marginTop:6 }}>Plan: Free</Text>
        </View>

        <Button title="Update to Premium" onPress={()=>navigation.navigate('Payment')} />

        <Button title="Delete Account" onPress={()=>Alert.alert('Delete Account','This action is permanent.',[
          { text:'Cancel', style:'cancel' },
          { text:'Delete', style:'destructive' }
        ])} style={{ backgroundColor:'#fee2e2' }} textStyle={{ color:'#111' }}/>

        <Button title="Logout" onPress={async()=>{ await signOut(auth); navigation.reset({ index:0, routes:[{ name:'Landing' }] }); }} />
      </View>
    </View>
  );
}
