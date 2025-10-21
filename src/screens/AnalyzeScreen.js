import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { generateLayout } from '../services/api'; // adjust path if needed

export default function AnalyzeScreen() {
  const [image, setImage] = useState(null);
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(false);

  // ⬇️ this is your function
  async function onAnalyzePress(localUri) {
    try {
      setLoading(true);
      const res = await generateLayout({ imageUri: localUri });
      setLoading(false);

      if (!res.ok) {
        Alert.alert('Error', res.error || 'Failed');
        return;
      }

      // res.suggestions contains the JSON from the model
      setDesign(res);
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', err?.message || 'Failed');
    }
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      setImage(result.assets[0].uri);
      setDesign(null);
    }
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>AI Room Analyzer</Text>

      {image ? (
        <Image
          source={{ uri: image }}
          style={{ width: 250, height: 250, borderRadius: 10, marginBottom: 16 }}
        />
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <>
          <Button title="Select Photo" onPress={pickImage} />
          {image ? (
            <View style={{ marginTop: 12 }}>
              <Button title="Analyze Photo" onPress={() => onAnalyzePress(image)} />
            </View>
          ) : null}
        </>
      )}

      {design ? (
        <View style={{ marginTop: 20, width: '100%' }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Room Summary:</Text>
          <Text>{design?.suggestions?.roomSummary || 'No summary'}</Text>
        </View>
      ) : null}
    </View>
  );
}

