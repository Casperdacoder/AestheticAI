import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function VideoCallScreen({ navigation }) {
  return (
    <View style={{ flex:1, backgroundColor:'#000' }}>
      <Image source={{ uri:'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200&q=60' }} style={{ width:'100%', height:'100%' }} resizeMode="cover" />
      <View style={{ position:'absolute', left:0, right:0, bottom:26, flexDirection:'row', justifyContent:'space-around' }}>
        <TouchableOpacity style={{ width:54, height:54, borderRadius:27, backgroundColor:'rgba(0,0,0,0.6)', alignItems:'center', justifyContent:'center' }}>
          <Ionicons name="videocam-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={{ width:54, height:54, borderRadius:27, backgroundColor:'rgba(0,0,0,0.6)', alignItems:'center', justifyContent:'center' }}>
          <Ionicons name="camera-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={{ width:54, height:54, borderRadius:27, backgroundColor:'rgba(0,0,0,0.6)', alignItems:'center', justifyContent:'center' }}>
          <Ionicons name="mic-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={{ width:54, height:54, borderRadius:27, backgroundColor:'#ef4444', alignItems:'center', justifyContent:'center' }}>
          <Ionicons name="call" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
