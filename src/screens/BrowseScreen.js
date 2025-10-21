import React, { useEffect, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Image,
  StatusBar
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Screen, Card, colors } from '../components/UI';
import { auth } from '../services/firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- Mock Data for Consultant List ---
const consultants = [
  { id: 1, name: "Elara Cruz", specialization: "Modern / Scandinavian", availability: "Mon, Thu, Wed" },
  { id: 2, name: "Amara Velasquez", specialization: "Minimalist / Industrial", availability: "Tue, Fri, Sat" },
  { id: 3, name: "Juan Dela Cruz", specialization: "Filipino / Tropical", availability: "Mon, Tue, Wed, Thu, Fri" },
  { id: 4, name: "Mia Gonzales", specialization: "Minimalist", availability: "Mon, Sat" },
];

const stylesList = ["All Styles", "Modern", "Minimalist", "Scandinavian", "Industrial"];
const WEEKDAY_OPTIONS = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// 🔹 Hero Section (Top Header with User + Notifications)
const HeroSection = ({ userName, photoURL, notifications }) => (
  <View style={styles.hero}>
    <StatusBar barStyle="light-content" backgroundColor={colors.surfaceMuted} />
    <View style={styles.heroTop}>
      <View style={styles.identity}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="person-circle" size={60} color="#fff" />
        )}
        <TouchableOpacity>
          <FontAwesome5 name="crown" size={22} color="#FFD700" style={{ marginLeft: -5 }} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.notificationWrapper}>
        <Ionicons name="notifications-outline" size={40} color="#fff" />
        {notifications?.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
    <Text style={styles.welcome}>Welcome, {userName}!</Text>
  </View>
);

// 🔹 Consultant Card
const ConsultantCard = ({ name, specialization, availability }) => (
  <View style={styles.cardContainer}>
    <View style={styles.consultantInfo}>
      <Ionicons name="person-circle-outline" size={60} color="#333" style={styles.profileIcon} />
      <View style={styles.textDetails}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.specialization}>Specialization: {specialization}</Text>
        <Text style={styles.availability}>Availability: {availability}</Text>
      </View>
      <Text style={styles.verified}>Verified</Text>
    </View>

    <View style={styles.buttonRow}>
      <TouchableOpacity style={styles.viewProfileButton}>
        <Text style={[styles.buttonText, { color: '#193f4eff' }]}>View Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.bookButton}>
        <Text style={styles.buttonText}>Book</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default function BrowseScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('All Styles');
  const [selectedDayFilter, setSelectedDayFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userName, setUserName] = useState('Loading...');
  const [photoURL, setPhotoURL] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // 🔹 Firebase Authentication (anonymous for demo)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserName(user.displayName || 'User');
        setPhotoURL(user.photoURL || null);
        setNotifications([
          { id: 1, title: 'New design approved!' },
          { id: 2, title: 'Consultation scheduled.' },
        ]);
      } else {
        await signInAnonymously(auth);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Filter Consultants
  const filteredConsultants = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    const styleLower = selectedStyle.toLowerCase();
    const dayLower = selectedDayFilter.toLowerCase();

    return consultants.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchLower) ||
        c.specialization.toLowerCase().includes(searchLower);

      const matchesStyle =
        styleLower === 'all styles' ||
        c.specialization.toLowerCase().includes(styleLower);

      const matchesDay =
        dayLower === 'all' ||
        c.availability.toLowerCase().includes(dayLower);

      return matchesSearch && matchesStyle && matchesDay;
    });
  }, [searchTerm, selectedStyle, selectedDayFilter]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <HeroSection userName={userName} photoURL={photoURL} notifications={notifications} />

        {/* 🔹 Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search consultants or styles"
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        {/* 🔹 Style Filter Tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsContainer}>
          {stylesList.map(style => (
            <TouchableOpacity
              key={style}
              style={[styles.tag, selectedStyle === style && styles.selectedTag]}
              onPress={() => setSelectedStyle(style)}
            >
              <Text style={[styles.tagText, selectedStyle === style && styles.selectedTagText]}>
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 🔹 Dropdown for Availability */}
        <View style={styles.filterWrapper}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Text style={styles.dropdownButtonText}>{selectedDayFilter}</Text>
            <Ionicons
              name={isDropdownOpen ? "chevron-up-outline" : "chevron-down-outline"}
              size={18}
              color="#333"
            />
          </TouchableOpacity>

          {isDropdownOpen && (
            <View style={styles.dropdownList}>
              {WEEKDAY_OPTIONS.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dropdownItem, day === selectedDayFilter && styles.activeDropdownItem]}
                  onPress={() => {
                    setSelectedDayFilter(day);
                    setIsDropdownOpen(false);
                  }}
                >
                  <Text
                    style={[styles.dropdownItemText, day === selectedDayFilter && styles.activeDropdownItemText]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 🔹 Consultant List */}
        {filteredConsultants.map((c) => (
          <ConsultantCard key={c.id} {...c} />
        ))}

        {filteredConsultants.length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No consultants found.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// 🔹 Styles
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.secondaryBackground },
  container: { flex: 1 },
  hero: {
    backgroundColor: colors.surfaceMuted,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarImage: { width: 55, height: 55, borderRadius: 28 },
  notificationWrapper: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  welcome: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 25 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    paddingHorizontal: 15,
    elevation: 3,
  },
  searchInput: { flex: 1, height: 40, fontSize: 16, marginLeft: 10, color: '#333' },

  tagsContainer: { paddingLeft: 20, marginBottom: 10 },
  tag: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EAEAEA',
    marginRight: 10,
  },
  selectedTag: { backgroundColor: colors.surfaceMuted },
  tagText: { fontSize: 14, color: '#333' },
  selectedTagText: { color: '#fff' },

  filterWrapper: { marginHorizontal: 20, marginBottom: 20, position: 'relative', zIndex: 10 },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  dropdownButtonText: { fontSize: 14, fontWeight: '600', color: '#333' },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 5,
    elevation: 5,
  },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  activeDropdownItem: { backgroundColor: '#EAEAEA' },
  dropdownItemText: { fontSize: 14 },
  activeDropdownItemText: { fontWeight: 'bold', color: colors.surfaceMuted },

  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 15,
    elevation: 4,
  },
  consultantInfo: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  profileIcon: { marginRight: 15 },
  textDetails: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  specialization: { fontSize: 14, color: '#666', marginTop: 5 },
  availability: { fontSize: 14, color: '#666', marginTop: 2 },
  verified: { color: '#4CAF50', fontSize: 12, position: 'absolute', top: 0, right: 0 },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-start', paddingLeft: 75 },
  viewProfileButton: {
    borderWidth: 1,
    borderColor: colors.surfaceMuted,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  bookButton: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 25,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  noResults: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  noResultsText: { fontSize: 16, color: '#666' },
});
