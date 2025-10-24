import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as DocumentPicker from 'expo-document-picker';
import { Screen, Input, Button } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Picker } from '@react-native-picker/picker';

export default function VerificationForm({ route, navigation }) {
  const uid = route?.params?.uid;

  useEffect(() => {
    if (!uid) {
      Alert.alert('Error', 'User ID not found.');
      navigation.goBack();
    }
  }, [uid]);

  const [portfolioFile, setPortfolioFile] = useState(null);
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [yearGraduated, setYearGraduated] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [specialization, setSpecialization] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [selectedDay, setSelectedDay] = useState('');
  const [timeSlots, setTimeSlots] = useState({});
  const [availabilityList, setAvailabilityList] = useState([]);

  // ✅ Pick Portfolio File
  const pickPortfolio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });

      if (result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setPortfolioFile(file);
        Alert.alert('File Selected', `You chose: ${file.name}`);
        console.log("File info:", file);
      } else if (result.type === 'success') {
        setPortfolioFile(result);
        Alert.alert('File Selected', `You chose: ${result.name}`);
        console.log("File info (legacy):", result);
      }
    } catch (error) {
      console.error("Document pick error:", error);
      Alert.alert('Error', 'Failed to select file.');
    }
  };

  // ✅ Add Availability
  const addAvailability = () => {
    if (!selectedDay || !timeSlots[selectedDay]?.[0] || !timeSlots[selectedDay]?.[1]) {
      Alert.alert('Validation', 'Please select a day and fill in both AM and PM times.');
      return;
    }

    const newAvailability = {
      day: selectedDay,
      am: timeSlots[selectedDay][0],
      pm: timeSlots[selectedDay][1],
    };

    setAvailabilityList((prev) => [...prev, newAvailability]);
    setSelectedDay('');
  };

  // ✅ Save All Details to Firestore
  const saveDetails = async () => {
    if (!portfolioFile || !school || !degree || !yearGraduated || !experienceYears || !specialization) {
      Alert.alert('Validation', 'Please fill all required fields and upload your portfolio.');
      return;
    }

    try {
      const storage = getStorage();

      const fileUri = portfolioFile.uri || portfolioFile.file || portfolioFile.assets?.[0]?.uri;
      if (!fileUri) {
        Alert.alert('Error', 'Portfolio file is invalid. Please re-upload.');
        return;
      }

      const response = await fetch(fileUri);
      const blob = await response.blob();

      const fileName = portfolioFile.name || portfolioFile.assets?.[0]?.name || `portfolio_${Date.now()}.pdf`;
      const storageRef = ref(storage, `portfolios/${uid}_${fileName}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'consultants', uid), {
        portfolio: downloadURL,
        education: { school, degree, yearGraduated },
        experience: { years: parseInt(experienceYears), specialization },
        availability: availabilityList,
        status: 'pending',
      });

      Alert.alert('Success', 'Registration complete. Pending admin verification.', [
        { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'LandingScreen' }] }) },
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert('Error', 'Failed to upload portfolio. Please try again.');
    }
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Step 2 - Consultant Details</Text>
        <Text style={styles.subtitle}>Fill in your details to continue</Text>

        {/* Education Section */}
        <Text style={styles.section}>Education</Text>
        <Input placeholder="School" value={school} onChangeText={setSchool} style={styles.input} />
        <Input placeholder="Degree" value={degree} onChangeText={setDegree} style={styles.input} />
        <Input placeholder="Year Graduated" value={yearGraduated} onChangeText={setYearGraduated} style={styles.input} />

        {/* Experience Section */}
        <Text style={styles.section}>Experience</Text>
        <Input
          placeholder="Years of Experience"
          value={experienceYears}
          onChangeText={setExperienceYears}
          style={styles.input}
        />
        <Input
          placeholder="Specialization"
          value={specialization}
          onChangeText={setSpecialization}
          style={styles.input}
        />

        {/* Availability Section */}
        <Text style={styles.section}>Availability</Text>
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedDay}
            onValueChange={(itemValue) => setSelectedDay(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Day" value="" />
            {days.map((day) => (
              <Picker.Item key={day} label={day} value={day} />
            ))}
          </Picker>
        </View>

        {selectedDay ? (
          <View style={{ marginTop: 10 }}>
            <Input
              placeholder="AM time (e.g. 9:00 AM - 12:00 PM)"
              value={timeSlots[selectedDay]?.[0] || ''}
              onChangeText={(text) =>
                setTimeSlots((prev) => ({ ...prev, [selectedDay]: [text, prev[selectedDay]?.[1] || ''] }))
              }
              style={styles.input}
            />
            <Input
              placeholder="PM time (e.g. 1:00 PM - 5:00 PM)"
              value={timeSlots[selectedDay]?.[1] || ''}
              onChangeText={(text) =>
                setTimeSlots((prev) => ({ ...prev, [selectedDay]: [prev[selectedDay]?.[0] || '', text] }))
              }
              style={styles.input}
            />

            <TouchableOpacity style={styles.addButton} onPress={addAvailability}>
              <Ionicons name="add-circle-outline" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Availability</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {availabilityList.length > 0 && (
          <View style={{ marginTop: 15 }}>
            <Text style={styles.section}>Selected Days:</Text>
            {availabilityList.map((item, index) => (
              <Text key={index} style={styles.availabilityItem}>
                • {item.day}: {item.am} / {item.pm}
              </Text>
            ))}
          </View>
        )}

        {/* Portfolio Upload Button */}
        <TouchableOpacity onPress={pickPortfolio} style={styles.uploadButtonOutlined}>
          <Ionicons name="cloud-upload-outline" size={22} color="#0F3E48" style={{ marginRight: 8 }} />
          <Text style={styles.uploadTextOutlined}>
            {portfolioFile ? portfolioFile.name : 'Upload Portfolio File'}
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <Button title="Submit" onPress={saveDetails} style={styles.button} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E9E8E8',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  scroll: { paddingBottom: 40 },
  title: {
    color: '#0F3E48',
    fontSize: 29,
    fontWeight: '900',
    fontFamily: 'serif',
    marginTop: 50,
    marginStart: 12,
    marginBottom: 3,
  },
  subtitle: {
    color: '#0F3E48',
    fontSize: 15,
    fontFamily: 'serif',
    marginStart: 12,
    marginBottom: 15,
    opacity: 0.8,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F3E48',
    marginStart: 12,
    marginBottom: 5,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#f2f3f4ff',
    marginBottom: 10,
  },
  picker: {
    height: 60,
    color: '#0F3E48',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F3E48',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontFamily: 'serif',
    fontSize: 16,
  },
  uploadButtonOutlined: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#0F3E48',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 11,
    marginTop: 20,
  },
  uploadTextOutlined: {
    color: '#0F3E48',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'serif',
  },
  availabilityItem: {
    fontSize: 15,
    fontFamily: 'serif',
    marginStart: 15,
    color: '#333',
  },
  button: { marginTop: 20, marginBottom: 30 },
});
