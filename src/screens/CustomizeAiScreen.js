import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
import { colors, Toast } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';

export default function CustomizeAiScreen() {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  const apply = () => { setApplied(true); setTimeout(()=>setApplied(false), 1600); };
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false), 1600); };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Toast visible={applied} text="Applied successfully!" onClose={()=>setApplied(false)} />
      <Toast visible={saved} text="Design saved successfully!" onClose={()=>setSaved(false)} />

      <Text style={{ color: colors.teal, fontWeight:'800', fontSize:20, marginBottom:10 }}>Customize with AI</Text>
      <Image source={{ uri: 'https://picsum.photos/seed/kitchen/800/600' }} style={{ width:'100%', height:180, borderRadius:10, marginBottom:12 }} />
      <View style={{ backgroundColor:'#e5e7eb', padding:12, borderRadius:10, maxWidth:'90%', marginTop:6 }}>
        <Text>Great choice! Which do you want to change?</Text>
      </View>

      <View style={{ position:'absolute', left:14, right:14, bottom:80, flexDirection:'row', justifyContent:'space-between' }}>
        <TouchableOpacity onPress={apply} style={{ paddingHorizontal:18, paddingVertical:10, borderRadius:20, borderColor: colors.teal, borderWidth:1 }}>
          <Text style={{ color: colors.teal }}>Apply Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={save} style={{ paddingHorizontal:18, paddingVertical:10, borderRadius:20, borderColor: colors.teal, borderWidth:1 }}>
          <Text style={{ color: colors.teal }}>Saved Design</Text>
        </TouchableOpacity>
      </View>

      <View style={{ position:'absolute', left:14, right:14, bottom:18, flexDirection:'row', alignItems:'center' }}>
        <TouchableOpacity style={{ padding:10, borderRadius:22, borderWidth:1, borderColor: colors.teal, marginRight:10 }}>
          <Ionicons name="cloud-upload-outline" size={20} color={colors.teal} />
        </TouchableOpacity>
        <View style={{ flex:1, flexDirection:'row', alignItems:'center', backgroundColor:'#fff', borderWidth:1, borderColor: colors.teal, borderRadius:22, paddingHorizontal:12 }}>
          <TextInput placeholder="Describe what you want to change...." value={text} onChangeText={setText} style={{ flex:1, height:40 }}/>
          <TouchableOpacity><Ionicons name="arrow-forward-circle" size={28} color={colors.teal} /></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
