import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen, Input, Button } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Picker } from '@react-native-picker/picker';
import { getAuth } from 'firebase/auth';

export default function VerificationForm({ navigation }) {
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [yearGraduated, setYearGraduated] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [availabilityList, setAvailabilityList] = useState([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [timeSlots, setTimeSlots] = useState({});

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
    setAvailabilityList(prev => [...prev, newAvailability]);
    setSelectedDay('');
  };

  const saveDetails = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'You must be logged in to continue.');
      return;
    }

    if (!school || !degree || !yearGraduated || !experienceYears || !specialization) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }

    try {
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

      await updateDoc(consultantRef, {
        education: { school, degree, yearGraduated },
        experience: { years: parseInt(experienceYears), specialization },
        availability: availabilityList,
        status: 'pending',
        updatedAt: new Date(),
      });

      Alert.alert('Success', 'Registration complete. Pending admin verification.', [
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
      console.error('❌ Save error:', err);
      Alert.alert('Error', `Save failed: ${err.message}`);
    }
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Step 2 - Consultant Details</Text>
        <Text style={styles.subtitle}>Fill in your details to continue</Text>

        <Text style={styles.section}>Education</Text>
        <Input placeholder="School" value={school} onChangeText={setSchool} style={styles.input} />
        <Input placeholder="Degree" value={degree} onChangeText={setDegree} style={styles.input} />
        <Input placeholder="Year Graduated" value={yearGraduated} onChangeText={setYearGraduated} style={styles.input} />

        <Text style={styles.section}>Experience</Text>
        <Input placeholder="Years of Experience" value={experienceYears} onChangeText={setExperienceYears} style={styles.input} />
        <Input placeholder="Specialization" value={specialization} onChangeText={setSpecialization} style={styles.input} />

        <Text style={styles.section}>Availability</Text>
        <View style={styles.dropdownContainer}>
          <Picker selectedValue={selectedDay} onValueChange={setSelectedDay} style={styles.picker}>
            <Picker.Item label="Select Day" value="" />
            {days.map(day => <Picker.Item key={day} label={day} value={day} />)}
          </Picker>
        </View>

        {selectedDay ? (
          <View style={{ marginTop: 10 }}>
            <Input
              placeholder="AM time (e.g. 9:00 AM - 12:00 PM)"
              value={timeSlots[selectedDay]?.[0] || ''}
              onChangeText={text => setTimeSlots(prev => ({ ...prev, [selectedDay]: [text, prev[selectedDay]?.[1] || ''] }))}
              style={styles.input}
            />
            <Input
              placeholder="PM time (e.g. 1:00 PM - 5:00 PM)"
              value={timeSlots[selectedDay]?.[1] || ''}
              onChangeText={text => setTimeSlots(prev => ({ ...prev, [selectedDay]: [prev[selectedDay]?.[0] || '', text] }))}
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

        <Button title="Submit" onPress={saveDetails} style={styles.button} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E9E8E8', paddingTop: 50, paddingHorizontal: 20 },
  scroll: { paddingBottom: 40 },
  title: { color: '#0F3E48', fontSize: 29, fontWeight: '900', fontFamily: 'serif', marginTop: 50, marginStart: 12 },
  subtitle: { color: '#0F3E48', fontSize: 15, fontFamily: 'serif', marginStart: 12, marginBottom: 15, opacity: 0.8 },
  input: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  section: { fontSize: 18, fontWeight: '600', color: '#0F3E48', marginStart: 12, marginBottom: 5 },
  dropdownContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, backgroundColor: '#f2f3f4ff', marginBottom: 10 },
  picker: { height: 60, color: '#0F3E48' },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F3E48', justifyContent: 'center', borderRadius: 10, paddingVertical: 10, marginTop: 10 },
  addButtonText: { color: '#fff', marginLeft: 6, fontFamily: 'serif', fontSize: 16 },
  availabilityItem: { fontSize: 15, fontFamily: 'serif', marginStart: 15, color: '#333' },
  button: { marginTop: 20, marginBottom: 30 },
});
