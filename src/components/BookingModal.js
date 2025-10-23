import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  StyleSheet
} from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { auth } from '../services/firebase';
import { colors } from './UI';

// 🔹 Constants
const TIME_SLOTS = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// 🔹 Helper: get weekday name for given date
function getWeekdayForDate(month, day) {
  if (!month || !day) return '';
  const monthIndex = MONTHS.indexOf(month);
  const year = new Date().getFullYear();
  const date = new Date(year, monthIndex, day);
  const options = { weekday: 'short' };
  return date.toLocaleDateString('en-US', options);
}

export default function BookingModal({ visible, onClose, consultant }) {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const selectedWeekday = getWeekdayForDate(selectedMonth, selectedDay);
  const isDayAvailable = !selectedWeekday || consultant?.availability?.includes(selectedWeekday);

  // 🔹 Handle Booking and Save to Firestore
  const handleBook = async () => {
    if (!selectedMonth || !selectedDay || !selectedTime) {
      Alert.alert("Error", "Please select month, day, and time.");
      return;
    }

    if (!isDayAvailable) {
      Alert.alert("Unavailable", `Consultant is not available on ${selectedWeekday}.`);
      return;
    }

    try {
      const db = getFirestore();
      const user = auth.currentUser;

      // ✅ Save booking to Firestore
      await addDoc(collection(db, "bookings"), {
      consultantId: consultant?.id || auth.currentUser?.uid || "unknown",
        consultantName: consultant?.name || "Unknown Consultant",
        clientId: user?.uid || "anonymous",
        clientName: user?.displayName || "Anonymous",
        date: `${selectedMonth} ${selectedDay}`,
        day: selectedWeekday,
        time: selectedTime,
        status: "pending",
        createdAt: new Date()
      });

      Alert.alert(
        "Booking Sent ✅",
        `Consultant: ${consultant?.name}\nDate: ${selectedMonth} ${selectedDay} (${selectedWeekday})\nTime: ${selectedTime}`
      );

      onClose();
      setSelectedMonth('');
      setSelectedDay('');
      setSelectedTime('');
    } catch (error) {
      console.error("Booking error:", error);
      Alert.alert("Error", "Failed to book. Please try again.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Book {consultant?.name}</Text>

          {/* 🔸 Weekday labels */}
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map(day => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>

          {/* 🔸 Month Selection */}
          <Text style={styles.label}>Select Month:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
            {MONTHS.map(month => (
              <TouchableOpacity
                key={month}
                style={[styles.dayButton, selectedMonth === month && styles.dayButtonSelected]}
                onPress={() => {
                  setSelectedMonth(month);
                  setSelectedDay('');
                }}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedMonth === month && { color: '#fff', fontWeight: '700' }
                  ]}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 🔸 Day Selection */}
          <Text style={styles.label}>Select Day:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollRow}>
            {DAYS.map(day => {
              const weekday = getWeekdayForDate(selectedMonth, day);
              const isAvailable = consultant?.availability?.includes(weekday);

              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    selectedDay === day && styles.dayButtonSelected,
                    selectedMonth && !isAvailable ? { opacity: 0.4 } : null
                  ]}
                  onPress={() => {
                    if (isAvailable) setSelectedDay(day);
                  }}
                  disabled={!isAvailable}
                >
                  <Text
                    style={[
                      styles.dayButtonText,
                      selectedDay === day && { color: '#fff', fontWeight: '700' }
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 🔸 Time Selection */}
          <Text style={styles.label}>Select Time:</Text>
          <FlatList
            data={TIME_SLOTS}
            horizontal
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.dayButton, selectedTime === item && styles.dayButtonSelected]}
                onPress={() => setSelectedTime(item)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedTime === item && { color: '#fff', fontWeight: '700' }
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* 🔸 Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={{ color: '#fff' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                !isDayAvailable ? { backgroundColor: '#aaa' } : null
              ]}
              onPress={handleBook}
              disabled={!isDayAvailable}
            >
              <Text style={{ color: '#fff' }}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// 🔹 Styles
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 5
  },
  weekdayText: {
    fontWeight: '600',
    color: '#555',
    width: 40,
    textAlign: 'center'
  },
  label: {
    marginTop: 10,
    fontWeight: '600'
  },
  scrollRow: {
    marginVertical: 5
  },
  dayButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#eee',
    borderRadius: 5,
    marginRight: 10,
    marginTop: 10
  },
  dayButtonSelected: {
    backgroundColor: colors.surfaceMuted
  },
  dayButtonText: {
    color: '#333'
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between'
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginRight: 10
  },
  confirmButton: {
    backgroundColor: colors.surfaceMuted,
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center'
  }
});
