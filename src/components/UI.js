import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';

export const colors = {
  teal: '#114D52',
  tealLight: '#1d6b72',
  gray: '#6b7280',
  bg: '#0f2f33'
};

export function Button({ title, onPress, style, textStyle }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[{
        backgroundColor: colors.teal,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center'
      }, style]}
    >
      <Text style={[{ color: '#fff', fontWeight: '700' }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Input(props) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#9ca3af"
      style={[{
        borderWidth: 1,
        borderColor: '#cbd5e1',
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: '#fff'
      }, props.style]}
    />
  );
}

export function Card({ children, style }) {
  return (
    <View style={[{
      backgroundColor: '#fff',
      padding: 14,
      borderRadius: 14,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3
    }, style]}>
      {children}
    </View>
  );
}

export function Toast({ visible, text, onClose }) {
  return (
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex:1, justifyContent:'flex-start', alignItems:'center', paddingTop:60, backgroundColor:'rgba(0,0,0,0.05)' }}>
        <View style={{ backgroundColor:'#22c55e', paddingHorizontal:16, paddingVertical:12, borderRadius:10, maxWidth:'90%' }}>
          <Text style={{ color:'#fff', fontWeight:'700' }}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
}
