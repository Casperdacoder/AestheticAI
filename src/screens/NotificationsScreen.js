import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../components/UI';

export default function NotificationsScreen() {
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ color: colors.teal, fontSize:22, fontWeight:'800', marginBottom:10 }}>Notifications</Text>
      <View style={{ backgroundColor:'#c2d3e2', padding:12, borderRadius:10, marginBottom:10 }}>
        <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed…</Text>
      </View>
      <View style={{ backgroundColor:'#c2d3e2', padding:12, borderRadius:10 }}>
        <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed…</Text>
      </View>
    </View>
  );
}
