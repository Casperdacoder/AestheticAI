import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet } from 'react-native';
import { Screen, Input, Button } from '../components/UI';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function VerificationForm({ route, navigation }) {
  const { uid } = route.params;

  const [portfolio, setPortfolio] = useState('');
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [yearGraduated, setYearGraduated] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [availabilityDays, setAvailabilityDays] = useState('');
  const [availabilitySlots, setAvailabilitySlots] = useState('');

  const saveDetails = async () => {
    if (!portfolio || !school || !degree || !yearGraduated || !experienceYears || !specialization) {
      Alert.alert('Validation', 'Please fill all required fields.');
      return;
    }

    try {
      await updateDoc(doc(db, 'consultants', uid), {
        portfolio,
        education: { school, degree, yearGraduated },
        experience: { years: parseInt(experienceYears), specialization },
        availability: {
          days: availabilityDays.split(',').map(d => d.trim()),
          slots: availabilitySlots.split(',').map(s => s.trim()),
        },
        status: 'pending', // 🔹 ensure pending until admin approves
      });

      console.log('Step 2 saved successfully for uid:', uid);

      Alert.alert('Success', 'Registration complete. Pending admin verification.', [
        {
          text: 'OK',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'LandingScreen' }] }),
        },
      ]);
    } catch (error) {
      console.error('Error saving Step 2:', error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Step 2 - Consultant Details</Text>

        <Input placeholder="Portfolio URL" value={portfolio} onChangeText={setPortfolio} style={styles.input} />
        <Text style={{ marginTop: 20 }}>Education</Text>
        <Input placeholder="School" value={school} onChangeText={setSchool} style={styles.input} />
        <Input placeholder="Degree" value={degree} onChangeText={setDegree} style={styles.input} />
        <Input placeholder="Year Graduated" value={yearGraduated} onChangeText={setYearGraduated} style={styles.input} />

        <Text style={{ marginTop: 20 }}>Experience</Text>
        <Input placeholder="Years of Experience" value={experienceYears} onChangeText={setExperienceYears} style={styles.input} />
        <Input placeholder="Specialization" value={specialization} onChangeText={setSpecialization} style={styles.input} />

        <Text style={{ marginTop: 20 }}>Availability (comma separated)</Text>
        <Input placeholder="Days e.g., Monday, Wednesday" value={availabilityDays} onChangeText={setAvailabilityDays} style={styles.input} />
        <Input placeholder="Slots e.g., 9:00-11:00, 14:00-16:00" value={availabilitySlots} onChangeText={setAvailabilitySlots} style={styles.input} />

        <Button title="Submit" onPress={saveDetails} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#E9E8E8', paddingTop: 50, paddingHorizontal: 20 },
  scroll: { paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '900', color: '#0F3E48', marginBottom: 20 },
  input: { marginBottom: 12 },
});
