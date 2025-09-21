import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { colors } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';

export default function ConsultantScreen({ navigation }) {
  const [text, setText] = useState('');
  const send = () => setText('');

  return (
    <View style={{ flex:1, padding:16 }}>
      <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
        <TouchableOpacity onPress={()=>navigation.goBack()}><Text style={{ color: colors.teal }}>Back</Text></TouchableOpacity>
        <TouchableOpacity onPress={()=>navigation.navigate('VideoCall')}><Ionicons name="videocam-outline" size={24} color={colors.teal} /></TouchableOpacity>
      </View>

      <Text style={{ color: colors.teal, fontWeight:'800', fontSize:20, marginTop:6 }}>Consultant</Text>

      <View style={{ backgroundColor:'#e5e7eb', padding:12, borderRadius:10, maxWidth:'80%', marginTop:16 }}>
        <Text>Hi! How can I help you?</Text>
      </View>
      <View style={{ backgroundColor:'#e5e7eb', padding:12, borderRadius:10, maxWidth:'80%', marginTop:10 }}>
        <Text>This is the color palette design my living room</Text>
      </View>

      <View style={{ position:'absolute', left:14, right:14, bottom:18, flexDirection:'row', alignItems:'center' }}>
        <View style={{ flex:1, flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderWidth:1, borderColor: colors.teal, borderRadius:22, paddingHorizontal:12 }}>
          <Ionicons name="attach-outline" size={22} color={colors.teal} style={{ marginRight:6 }} />
          <TextInput placeholder="Ask your consultant......" value={text} onChangeText={setText} style={{ flex:1, height:40 }}/>
          <TouchableOpacity onPress={send}><Ionicons name="arrow-forward-circle" size={28} color={colors.teal} /></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
