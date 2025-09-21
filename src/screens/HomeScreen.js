import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Card, colors } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <View style={{ flex:1 }}>
      {/* header card */}
      <View style={{ backgroundColor: colors.teal, padding:16, paddingTop:50 }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:10 }}>
            <View style={{ width:44, height:44, borderRadius:22, backgroundColor:'#e5e7eb' }} />
            <Ionicons name="crown" size={20} color="#ffd54a" />
          </View>
          <TouchableOpacity onPress={()=>navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#e5e7eb" />
          </TouchableOpacity>
        </View>
        <Text style={{ color:'#e5e7eb', fontSize:20, fontWeight:'800', marginTop:10 }}>Welcome Username!</Text>
      </View>

      <View style={{ padding:16, gap:12 }}>
        <View style={{ flexDirection:'row', gap:12 }}>
          <Card style={{ flex:1, alignItems:'center' }}>
            <Ionicons name="color-palette-outline" size={38} color={colors.teal} />
            <TouchableOpacity onPress={()=>navigation.navigate('Assistant')}><Text style={{ marginTop:8, color: colors.teal, fontWeight:'700' }}>Design with AI</Text></TouchableOpacity>
          </Card>
          <Card style={{ flex:1, alignItems:'center' }}>
            <Ionicons name="settings-outline" size={38} color={colors.teal} />
            <TouchableOpacity onPress={()=>navigation.navigate('CustomizeAI')}><Text style={{ marginTop:8, color: colors.teal, fontWeight:'700' }}>Customize with AI</Text></TouchableOpacity>
          </Card>
        </View>

        <Card style={{ alignItems:'center' }}>
          <Ionicons name="headset-outline" size={38} color={colors.teal} />
          <TouchableOpacity onPress={()=>navigation.navigate('Consultant')}><Text style={{ marginTop:8, color: colors.teal, fontWeight:'700' }}>Consultation</Text></TouchableOpacity>
        </Card>

        <Text style={{ marginTop:8, color: colors.teal, fontWeight:'800' }}>My Designs</Text>
        <TouchableOpacity onPress={()=>navigation.navigate('Projects')} style={{ alignSelf:'flex-end' }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
            <Text style={{ color: colors.teal }}>View All</Text>
            <Ionicons name="arrow-forward-circle" size={22} color={colors.teal}/>
          </View>
        </TouchableOpacity>

        <Card>
          <Image source={{ uri:'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80' }} style={{ width:'100%', height:160, borderRadius:8 }} />
          <Text style={{ marginTop:8, color:'#111' }}>Design 1</Text>
        </Card>
      </View>
    </View>
  );
}
