import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { colors } from '../components/UI';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function UploadScreen({ navigation }) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [uri, setUri] = useState(null);

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchCameraAsync({ quality:0.8 });
    if (!res.canceled) {
      setUri(res.assets[0].uri);
      navigation.navigate('DesignDetail', { uploadedUri: res.assets[0].uri });
    }
  };

  const openLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({ quality:0.8 });
    if (!res.canceled) {
      setUri(res.assets[0].uri);
      navigation.navigate('DesignDetail', { uploadedUri: res.assets[0].uri });
    }
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ color: colors.teal, fontSize:22, fontWeight:'800', marginBottom:10 }}>Upload a Photo</Text>
      <TouchableOpacity
        onPress={()=>setPickerVisible(true)}
        style={{ height:280, borderRadius:14, borderWidth:1, borderStyle:'dashed', borderColor:'#cbd5e1', alignItems:'center', justifyContent:'center', backgroundColor:'#e5e7eb' }}
      >
        <Ionicons name="cloud-upload-outline" size={42} color={colors.teal} />
        <Text style={{ marginTop:8, color: colors.teal, fontWeight:'700' }}>Upload</Text>
      </TouchableOpacity>

      <Modal transparent visible={pickerVisible} animationType="fade" onRequestClose={()=>setPickerVisible(false)}>
        <View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.35)', padding:22 }}>
          <View style={{ backgroundColor:'#fff', width:'100%', borderRadius:14, overflow:'hidden' }}>
            <View style={{ padding:16 }}><Text style={{ color: colors.teal, fontWeight:'800' }}>Select Media Source</Text></View>
            <TouchableOpacity onPress={()=>{ setPickerVisible(false); openCamera(); }} style={{ padding:16, flexDirection:'row', alignItems:'center', gap:12 }}>
              <Ionicons name="camera-outline" size={22} color={colors.teal} /><Text>Take photo from camera</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>{ setPickerVisible(false); openLibrary(); }} style={{ padding:16, flexDirection:'row', alignItems:'center', gap:12 }}>
              <Ionicons name="image-outline" size={22} color={colors.teal} /><Text>Choose from the gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setPickerVisible(false)} style={{ padding:14, alignItems:'center' }}>
              <Text style={{ color: colors.teal, fontWeight:'700' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
