import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Button, Input, colors, Toast } from '../components/UI';

export default function PaymentScreen() {
  const [num, setNum] = useState('');
  const [ok, setOk] = useState(false);

  const pay = () => {
    if (!num) return;
    setOk(true); setTimeout(()=>setOk(false), 1500);
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Toast visible={ok} text="Pay successfully!" onClose={()=>setOk(false)} />
      <Text style={{ color: colors.teal, fontSize:22, fontWeight:'800', marginBottom:10 }}>Pay with GCash</Text>
      <Text style={{ marginBottom:6 }}>Plan: Yearly / Monthly</Text>
      <Text style={{ marginBottom:10 }}>Enter GCash Number:</Text>
      <Input placeholder="09xxxxxxxxx" keyboardType="numeric" value={num} onChangeText={setNum}/>
      <Button title="Pay Now" onPress={pay}/>
    </View>
  );
}
