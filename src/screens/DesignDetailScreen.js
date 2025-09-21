import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { colors } from '../components/UI';

export default function DesignDetailScreen({ route, navigation }) {
  const img = route?.params?.uploadedUri || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=60';

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ color: colors.teal, fontSize:22, fontWeight:'800', marginBottom:10 }}>Design 1</Text>
      <Image source={{ uri: img }} style={{ width:'100%', height:220, borderRadius:10, backgroundColor:'#e5e7eb' }}/>
      <View style={{ flexDirection:'row', gap:10, marginTop:10 }}>
        <TouchableOpacity style={{ borderWidth:1, borderColor: colors.teal, paddingHorizontal:16, paddingVertical:8, borderRadius:20 }}>
          <Text style={{ color: colors.teal }}>View in 2D</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ borderWidth:1, borderColor: colors.teal, paddingHorizontal:16, paddingVertical:8, borderRadius:20 }}>
          <Text style={{ color: colors.teal }}>View in 3D</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ marginTop:16, color: colors.teal, fontWeight:'800' }}>Design Details</Text>
      <Text style={{ marginTop:6 }}>Style: Modern Living Room</Text>
      <Text>Room Size: 4m x 5m</Text>

      <Text style={{ marginTop:10 }}>Color Palette:</Text>
      <View style={{ flexDirection:'row', gap:10, marginTop:6 }}>
        {['#f0efe9','#d6ccc2','#adb5bd','#84a59d'].map(c=>(
          <View key={c} style={{ width:24, height:24, borderRadius:12, backgroundColor:c, borderWidth:1, borderColor:'#e5e7eb' }}/>
        ))}
      </View>

      <Text style={{ marginTop:10 }}>AI Tips:</Text>
      <Text>• Use lighter curtains</Text>
      <Text>• Add greenery near the window</Text>

      <View style={{ position:'absolute', left:16, right:16, bottom:20, flexDirection:'row', gap:12 }}>
        <TouchableOpacity onPress={()=>navigation.navigate('CustomizeAI')} style={{ flex:1, borderWidth:1, borderColor: colors.teal, paddingVertical:12, borderRadius:12, alignItems:'center' }}>
          <Text style={{ color: colors.teal }}>Customize</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex:1, backgroundColor: colors.teal, paddingVertical:12, borderRadius:12, alignItems:'center' }}>
          <Text style={{ color:'#fff', fontWeight:'700' }}>Export</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
