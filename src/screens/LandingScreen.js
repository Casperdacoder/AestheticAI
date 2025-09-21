import React from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { Button, colors } from '../components/UI';

export default function LandingScreen({ navigation }) {
  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80' }}
      style={{ flex:1, justifyContent:'center', padding:22 }}
      imageStyle={{ opacity:0.85 }}
    >
      <View style={{ backgroundColor:'rgba(255,255,255,0.9)', padding:18, borderRadius:14 }}>
        <Text style={{ color: colors.teal, fontSize:34, fontWeight:'800', textAlign:'center' }}>Aesthetic AI</Text>
        <Text style={{ textAlign:'center', marginVertical:10 }}>How do you plan to use the app?</Text>
        <Text style={{ textAlign:'center', color:colors.teal, fontWeight:'700' }}>LOGIN AS</Text>
        <Button title="User" style={{ marginTop:14 }} onPress={()=>navigation.navigate('Login', { role:'user' })}/>
        <Button title="Designer" style={{ marginTop:10, backgroundColor:'#0d3c40' }} onPress={()=>navigation.navigate('Login', { role:'designer' })}/>
      </View>
    </ImageBackground>
  );
}
