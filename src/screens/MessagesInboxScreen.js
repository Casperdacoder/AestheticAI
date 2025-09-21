import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../components/UI';

export default function MessagesInboxScreen({ navigation }) {
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ color: colors.teal, fontSize:22, fontWeight:'800', marginBottom:10 }}>Messages</Text>
      <TouchableOpacity onPress={()=>navigation.navigate('Consultant')} style={{ padding:14, borderRadius:12, backgroundColor:'#c2d3e2' }}>
        <Text>Consultant messaged you…</Text>
      </TouchableOpacity>
    </View>
  );
}
