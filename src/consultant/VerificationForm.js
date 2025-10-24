import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Screen, Input, Button } from '../components/UI';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Picker } from '@react-native-picker/picker';

export default function VerificationForm({ navigation }) {
  const [portfolioFiles, setPortfolioFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [yearGraduated, setYearGraduated] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [availabilityList, setAvailabilityList] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const years = ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'];

  // ✅ Pick multiple portfolio files
  const pickPortfolios = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/*',
        ],
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const files = result.assets.map((f) => ({
          name: f.name,
          uri: f.uri,
          mimeType: f.mimeType || 'application/octet-stream',
        }));
        setPortfolioFiles((prev) => [...prev, ...files]);
        Alert.alert('Files Selected', `${files.length} file(s) added.`);
      }
    } catch (error) {
      console.error('Document pick error:', error);
      Alert.alert('Error', 'Failed to select files.');
    }
  };

  // ✅ Add availability
  const addAvailability = () => {
    if (!selectedDay || !selectedTime) {
      Alert.alert('Validation', 'Please select both day and time slot.');
      return;
    }
    const newAvailability = { day: selectedDay, time: selectedTime };
    setAvailabilityList((prev) => [...prev, newAvailability]);
    setSelectedDay('');
    setSelectedTime('');
  };

  // ✅ Upload and save consultant details
  const saveDetails = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'You must be logged in to continue.');
      return;
    }

    if (
      portfolioFiles.length === 0 ||
      !school ||
      !degree ||
      !yearGraduated ||
      !experienceYears ||
      !specialization
    ) {
      Alert.alert('Validation', 'Please fill all required fields and upload your portfolio.');
      return;
    }

    try {
      setUploading(true);
      const uid = user.uid;
      const consultantRef = doc(db, 'consultants', uid);
      const consultantDoc = await getDoc(consultantRef);

      if (!consultantDoc.exists()) {
        await setDoc(consultantRef, {
          uid,
          email: user.email || null,
          createdAt: new Date(),
          status: 'incomplete',
        });
      }

      const storage = getStorage();
      const uploadedURLs = [];

      // ✅ Upload each selected portfolio file
      for (const file of portfolioFiles) {
        const fileName = `${uid}_${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const storageRef = ref(storage, `portfolio/${fileName}`);

        // Convert to base64 → Blob for upload (Expo-safe)
        const base64 = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const blob = await fetch(`data:${file.mimeType};base64,${base64}`).then((res) => res.blob());

        await uploadBytes(storageRef, blob, { contentType: file.mimeType });
        const downloadURL = await getDownloadURL(storageRef);
        uploadedURLs.push(downloadURL);
      }

      // ✅ Save all data in Firestore
      await updateDoc(consultantRef, {
        portfolio: uploadedURLs,
        education: { school, degree, yearGraduated },
        experience: { years: parseInt(experienceYears, 10), specialization },
        availability: availabilityList,
        status: 'pending',
        updatedAt: new Date(),
      });

      Alert.alert('Success', 'Verification form submitted successfully.', [
        {
          text: 'OK',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'LandingScreen' }],
            }),
        },
      ]);
    } catch (err) {
      console.error('❌ Upload error:', err);
      Alert.alert('Error', 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Consultant Verification</Text>
        <Text style={styles.subtitle}>Complete your profile for admin approval</Text>

        {/* Upload Section */}
        <Button title="Upload Portfolio Files" onPress={pickPortfolios} />
        {portfolioFiles.length > 0 && (
          <View style={{ marginVertical: 10 }}>
            {portfolioFiles.map((file, i) => (
              <Text key={i} style={{ fontSize: 14, marginVertical: 2 }}>
                • {file.name}
              </Text>
            ))}
          </View>
        )}

        {/* Education */}
        <Text style={styles.section}>Background Education</Text>
        <Input placeholder="School / University" value={school} onChangeText={setSchool} />
        <Input placeholder="Degree / Course" value={degree} onChangeText={setDegree} />

        <Text style={styles.label}>Year Graduated</Text>
        <Picker
          selectedValue={yearGraduated}
          onValueChange={setYearGraduated}
          style={styles.picker}
        >
          <Picker.Item label="Select Year" value="" />
          {years.map((y) => (
            <Picker.Item key={y} label={y} value={y} />
          ))}
        </Picker>

        {/* Experience */}
        <Text style={styles.section}>Experience</Text>
        <Picker
          selectedValue={experienceYears}
          onValueChange={setExperienceYears}
          style={styles.picker}
        >
          <Picker.Item label="Select Years of Experience" value="" />
          {[...Array(21).keys()].map((n) => (
            <Picker.Item key={n} label={`${n} year(s)`} value={n.toString()} />
          ))}
        </Picker>

        <Input
          placeholder="Specialization / Expertise"
          value={specialization}
          onChangeText={setSpecialization}
        />

        {/* Schedule */}
        <Text style={styles.section}>Schedule / Availability</Text>
        <Picker selectedValue={selectedDay} onValueChange={setSelectedDay} style={styles.picker}>
          <Picker.Item label="Select Day" value="" />
          {days.map((d) => (
            <Picker.Item key={d} label={d} value={d} />
          ))}
        </Picker>

        <Input
          placeholder="Available Time (e.g., 9:00AM - 5:00PM)"
          value={selectedTime}
          onChangeText={setSelectedTime}
        />
        <Button title="Add Availability" onPress={addAvailability} />

        {availabilityList.map((item, index) => (
          <Text key={index} style={{ marginVertical: 3 }}>
            • {item.day} - {item.time}
          </Text>
        ))}

        <View style={{ marginVertical: 20 }}>
          {uploading ? (
            <ActivityIndicator size="large" color="#0F3E48" />
          ) : (
            <Button title="Submit Verification" onPress={saveDetails} />
          )}
        </View>
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
  title: {
    color: '#0F3E48',
    fontSize: 26,
    fontWeight: '900',
    fontFamily: 'serif',
    marginTop: 40,
  },
  subtitle: {
    color: '#0F3E48',
    fontSize: 14,
    fontFamily: 'serif',
    marginBottom: 25,
    opacity: 0.8,
  },
  section: {
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 20,
    color: '#0F3E48',
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
});
