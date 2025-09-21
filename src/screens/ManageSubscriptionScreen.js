import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Button, colors, Toast } from '../components/UI';

export default function ManageSubscriptionScreen() {
  const [cancelled, setCancelled] = useState(false);
  const onCancel = () => {
    Alert.alert('Cancel Subscription', 'Are you sure you want to cancel?', [
      { text:'No' },
      { text:'Yes', onPress:()=>{ setCancelled(true); setTimeout(()=>setCancelled(false),1600); } }
    ]);
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Toast visible={cancelled} text="Your subscription has been successfully cancelled." onClose={()=>setCancelled(false)} />
      <Text style={{ color: colors.teal, fontSize:22, fontWeight:'800', marginBottom:10 }}>Manage Subscription</Text>
      <Text style={{ marginBottom:4 }}>Plan: Premium</Text>
      <Text style={{ marginBottom:4 }}>Renew on: Date</Text>
      <Text style={{ marginBottom:12 }}>Status: Active</Text>

      <Text style={{ fontWeight:'700', marginBottom:6 }}>Current Plan:</Text>
      {[
        'Unlimited AI layout suggestions',
        'Multi-room analysis',
        'Custom color palettes',
        '3D visualizations',
        'Expert décor tips',
        'Personalized design advice'
      ].map(t => <Text key={t}>• {t}</Text>)}

      <Button title="Cancel Subscription" onPress={onCancel} style={{ marginTop:18, backgroundColor:'#fee2e2' }} textStyle={{ color:'#111' }}/>
    </View>
  );
}
