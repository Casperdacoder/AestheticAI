import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, StatusBar } from 'react-native';
import { Screen, Card, colors } from '../components/UI';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { getCachedUserRole } from '../services/userCache';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const SAMPLE_DESIGNS = [
  { id: '1', title: 'Modern Living Room', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80' },
  { id: '2', title: 'Scandinavian Loft', image: 'https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=800&q=80' },
  { id: '3', title: 'Minimalist Bedroom', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&sig=1' },
  { id: '4', title: 'Cozy Studio', image: 'https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=800&sig=2' },
  { id: '5', title: 'Urban Workspace', image: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?w=800&q=80' },
];

export default function HomeScreen({ navigation }) {
  const [isDesigner, setIsDesigner] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [userName, setUserName] = useState('');
  const [photoURL, setPhotoURL] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const resolveRoleAndUser = async () => {
      try {
        const user = auth.currentUser;
        const uid = user?.uid;
        const cachedRole = uid ? await getCachedUserRole(uid) : null;

        if (isMounted) {
          setIsDesigner((cachedRole || 'user') === 'designer');
          setRoleChecked(true);
          const name = user?.displayName || user?.email?.split('@')[0] || 'User';
          setUserName(name);
          setPhotoURL(user?.photoURL || null);
        }
      } catch {
        if (isMounted) {
          setIsDesigner(false);
          setRoleChecked(true);
          setUserName('User');
          setPhotoURL(null);
        }
      }
    };
    resolveRoleAndUser();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    setNotifications([
      { id: 1, title: 'New design approved!' },
      { id: 2, title: 'Your consultation is scheduled.' },
    ]);
  }, []);

  const handleNotificationsPress = () => {
    navigation.navigate('Notifications', { notifications });
  };

  const handleEditAccount = () => {
    navigation.navigate('Account');
  };

  const designs = useMemo(() => SAMPLE_DESIGNS.slice(0, 2), []);

  return (
    <Screen inset={false} style={styles.screen}>
      <ExpoStatusBar style="light" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.identity}>
              {photoURL ? (
                <Image source={{ uri: photoURL }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="person-circle-outline" size={40} color="#FFFFFF" />
                </View>
              )}
              <TouchableOpacity onPress={handleEditAccount} style={styles.crownWrapper}>
                <FontAwesome5 name="crown" size={24} color="#FFD700" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleNotificationsPress} style={styles.notificationWrapper}>
              <Ionicons name="notifications-outline" size={42} color={colors.primaryText} />
              {notifications.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notifications.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.welcome}>Welcome, {userName}!</Text>
        </View>

        {/* Quick Actions Section */}
      <View style={styles.section}>
  <View style={styles.quickGrid}>
    {/* Design with AI */}
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate('Assistant')}
      style={styles.quickCard}
    >
      <View style={[styles.iconCircle, { backgroundColor: '#316d79ff', borderRadius: 42 }]}>
        <Ionicons name="color-palette" size={22} color="#fff" />
      </View>
      <Text style={styles.quickTextDark}>Design with AI</Text>
    </TouchableOpacity>

    {/* Customize with AI */}
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate('CustomizeAI')}
      style={styles.quickCard}
    >
      <View style={[styles.iconCircle, { backgroundColor: '#2A9D8F', borderRadius: 42 }]}>
        <Ionicons name="construct" size={22} color="#fff" />
      </View>
      <Text style={styles.quickTextDark}>Customize with AI</Text>
    </TouchableOpacity>

    {/* Consultation */}
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate('Browse')}
      style={styles.quickCard}
    >
      <View style={[styles.iconCircle, { backgroundColor: '#2f7bb9ff', borderRadius: 42 }]}>
        <Ionicons name="chatbubbles" size={22} color="#fff" />
      </View>
      <Text style={styles.quickTextDark}>Consultation</Text>
    </TouchableOpacity>
  </View>
</View>

        {/* Recent Designs Section */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Designs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Projects')} style={styles.viewAll}>
              <FontAwesome5 name="arrow-right" size={20} color={colors.primaryDark} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={160}
            decelerationRate="fast"
            contentContainerStyle={styles.recentScroll}
          >
            {designs.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recentDesignOption}
                activeOpacity={0.82}
                onPress={() =>
                  navigation.navigate('DesignDetail', { uploadedUri: item.image, title: item.title })
                }
              >
                <Card style={styles.recentDesignCard}>
                  <View style={styles.designImageWrapper}>
                    <Image source={{ uri: item.image }} style={styles.designImage} />
                    <View style={styles.designIconOverlay}>
                      <Ionicons name="folder" size={18} color="#fff" />
                    </View>
                  </View>
                  <Text style={styles.designTitle}>{item.title}</Text>
                </Card>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
   hero: {
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 64,
    paddingHorizontal: 24,
    paddingBottom: 28,
    gap: 12
  },
 heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
    identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crownWrapper: { marginLeft: -5, marginTop: 2 },
  notificationWrapper: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700', marginStart: 2 },
  welcome: { color: colors.primaryText, fontSize: 22, fontWeight: '700', marginTop: 35, marginBottom: 0, fontFamily: 'serif' },

  section: { marginTop: 20, marginBottom: 10 },

  // Quick Actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginHorizontal: 24 },
  quickCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    backgroundColor: '#fff',
    marginBottom: 14,
  },
  iconCircle: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconCircleCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }, // fully circular
  quickTextDark: { fontWeight: '700', fontSize: 16, color: '#333', marginLeft: 14, fontFamily: 'serif' },

  // Recent Designs
  recentSection: { marginTop: 0, marginBottom: 20 },
  recentDesignOption: { width: 300, alignSelf: 'center' },
  recentDesignCard: {
    backgroundColor: '#fff',
    marginTop: 15,
    marginStart: 10,
    margin: 10,
    borderRadius: 2,
    borderWidth: 0,
    overflow: 'hidden',
    shadowColor: '#575656ff',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    padding: 0,
  },
  designImageWrapper: { position: 'relative' },
  designImage: { width: '100%', height: 200 },
  designIconOverlay: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', padding: 4, borderRadius: 6 },
  designTitle: { color: colors.subtleText, fontWeight: '600', fontSize: 14, textAlign: 'center', paddingVertical: 10, paddingHorizontal: 6 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 24, marginTop: 20 },
  sectionTitle: { color: colors.subtleText, fontSize: 18, fontWeight: '700', fontFamily: 'serif' },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
