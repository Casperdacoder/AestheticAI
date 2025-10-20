import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ConsultationsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('All');

  const consultations = [
    { id: 1, name: 'Elara Cruz', topic: 'Living Room Redesign', time: 'Now', status: 'Ongoing' },
    { id: 2, name: 'Amara Velasquez', date: 'Sept 27, 2:00 PM', mode: 'Video Call', status: 'Upcoming' },
    { id: 3, name: 'Juan Dela Cruz', date: 'Sept 12', notes: 'Shared files, recommendations', status: 'Past' },
  ];

  const filteredConsultations =
    activeTab === 'All'
      ? consultations
      : consultations.filter(item => item.status === activeTab);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0F3E48" barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section (full top area) */}
        <View style={styles.heroSection}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {['All', 'Ongoing', 'Upcoming', 'Past'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabItem, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Consultations List */}
        {filteredConsultations.map(item => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardRow}>
              <Ionicons name="person-circle-outline" size={45} color="#0F3E48" />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardName}>{item.name}</Text>
                {item.topic && <Text style={styles.cardText}>Topic: {item.topic}</Text>}
                {item.time && <Text style={styles.cardText}>Time: {item.time}</Text>}
                {item.date && <Text style={styles.cardText}>Date: {item.date}</Text>}
                {item.mode && <Text style={styles.cardText}>Mode: {item.mode}</Text>}
                {item.notes && <Text style={styles.cardText}>Notes: {item.notes}</Text>}
              </View>
              <Text
                style={[
                  styles.statusText,
                  item.status === 'Ongoing'
                    ? styles.statusOngoing
                    : item.status === 'Upcoming'
                    ? styles.statusUpcoming
                    : styles.statusPast,
                ]}
              >
                {item.status}
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              {item.status === 'Ongoing' && (
                <TouchableOpacity style={[styles.btn, styles.btnJoin]}>
                  <Text style={styles.btnJoinText}>Join Now</Text>
                </TouchableOpacity>
              )}
              {item.status === 'Upcoming' && (
                <>
                  <TouchableOpacity style={[styles.btn, styles.btnDetails]}>
                    <Text style={styles.btnDetailsText}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnCancel]}>
                    <Text style={styles.btnCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
              {item.status === 'Past' && (
                <TouchableOpacity style={[styles.btn, styles.btnDetails]}>
                  <Text style={styles.btnDetailsText}>View Report</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4F4',
  },
  heroSection: {
    backgroundColor: '#0F3E48',
    marginTop: 20,
    paddingBottom: 20,
    paddingTop: StatusBar.currentHeight || 40, // para sumagad sa top
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginTop: 0,
    marginRight: 10,
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  tabItem: {
    paddingVertical: 5,
  },
  tabText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFFFFF',
  },
  activeTabText: {
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F3E48',
  },
  cardText: {
    fontSize: 13,
    color: '#333',
  },
  statusText: {
    position: 'absolute',
    right: 10,
    top: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  statusOngoing: { color: 'green' },
  statusUpcoming: { color: '#0F3E48' },
  statusPast: { color: 'red' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  btn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  btnJoin: {
    borderColor: 'green',
  },
  btnJoinText: {
    color: 'green',
    fontWeight: '600',
  },
  btnDetails: {
    borderColor: '#0F3E48',
  },
  btnDetailsText: {
    color: '#0F3E48',
    fontWeight: '600',
  },
  btnCancel: {
    borderColor: 'red',
  },
  btnCancelText: {
    color: 'red',
    fontWeight: '600',
  },
});
