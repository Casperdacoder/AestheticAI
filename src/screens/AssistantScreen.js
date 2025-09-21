import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { colors, Toast } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';

export default function AssistantScreen({ navigation }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const send = () => setText('');

  return (
    <View style={{ flex:1, padding:16 }}>
      <Toast visible={saved} text="Design saved successfully!" onClose={()=>setSaved(false)} />
      <Text style={{ color: colors.teal, fontWeight:'800', fontSize:20, marginBottom:10 }}>AI Design Assistant</Text>

      <View style={{ backgroundColor:'#e5e7eb', padding:12, borderRadius:10, maxWidth:'80%', marginBottom:8 }}>
        <Text>Hi! How can I help you with your room design today?</Text>
      </View>
      <View style={{ backgroundColor:'#e5e7eb', padding:12, borderRadius:10, maxWidth:'80%' }}>
        <Text>This is the color palette design my living room</Text>
      </View>

      <View style={{ position:'absolute', left:14, right:14, bottom:18, flexDirection:'row', alignItems:'center' }}>
        <TouchableOpacity onPress={()=>navigation.navigate('Projects')} style={{ padding:10, borderRadius:22, borderWidth:1, borderColor: colors.teal, marginRight:10 }}>
          <Ionicons name="cloud-upload-outline" size={20} color={colors.teal} />
        </TouchableOpacity>
        <View style={{ flex:1, flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderWidth:1, borderColor: colors.teal, borderRadius:22, paddingHorizontal:12 }}>
          <TextInput placeholder="Ask AI to design your room......" value={text} onChangeText={setText} style={{ flex:1, height:40 }}/>
          <TouchableOpacity onPress={send}><Ionicons name="arrow-forward-circle" size={28} color={colors.teal} /></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
