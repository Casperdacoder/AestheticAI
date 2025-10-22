import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { loadProfile } from '../services/profileStore';
import { cacheUserRole, getCachedUserRole } from '../services/userCache';
import { colors, Button } from '../components/UI';

export default function AccountUserScreen({ navigation }) {
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false); // toggle dropdown
  const email = user?.email || 'example@gmail.com';

  useEffect(() => {
    let mounted = true;
    const hydrateProfile = async () => {
      if (!user?.uid) return;
      const cachedProfile = await loadProfile(user.uid);
      if (mounted) {
        if (cachedProfile) {
          setProfile({ ...cachedProfile, email: cachedProfile.email || email });
          await cacheUserRole(user.uid, cachedProfile.role || 'user');
        } else {
          setProfile({ role: await getCachedUserRole(user.uid) || 'user', name: user?.displayName || 'User', email });
        }
      }
    };
    hydrateProfile();
    return () => (mounted = false);
  }, [user, email]);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
        },
      },
    ]);
  };

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your account...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      <StatusBar barStyle="light-content" />

      {/* Hero Section */}
      <View style={styles.hero}></View>

      {/* Avatar Section */}
      <View style={styles.avatarWrapper}>
        {profile.photoURL ? (
          <Image source={{ uri: profile.photoURL }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Ionicons name="person-circle-outline" size={90} color={colors.primary} />
          </View>
        )}

        {/* camera button */}
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => navigation.navigate('ProfileEdit')}
        >
          <Ionicons name="camera" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileMeta}>
        <Text style={styles.profileName}>{profile.name || 'User Name'}</Text>
        <Text style={styles.profileEmail}>{email}</Text>
        <Button
          title="Edit Profile"
          variant="secondary"
          onPress={() => navigation.navigate('ProfileEdit')}
          style={styles.editButton}
        />
      </View>

      {/* Account Settings Section */}
      <View style={styles.cardSection}>
        {/* Divider sa taas ng Change Password */}
        <View style={styles.divider} />

        <TouchableOpacity onPress={() => navigation.navigate('Security')}>
          <Text style={styles.listItem}>Change Password</Text>
        </TouchableOpacity>

        {/* Divider sa baba ng Change Password */}
        <View style={styles.divider} />

        {/* Subscription with dropdown */}
        <TouchableOpacity 
          style={styles.subscriptionItem} 
          onPress={() => setShowUpgrade(!showUpgrade)}
        >
          <Text style={styles.listItem}>Subscription Plan: Free</Text>
          <Ionicons 
            name={showUpgrade ? 'chevron-up-outline' : 'chevron-down-outline'} 
            size={20} 
            color={colors.subtleText} 
          />
        </TouchableOpacity>

        {showUpgrade && (
          <Button
            title="Upgrade to Premium"
            onPress={() => navigation.navigate('Payment')}
            style={styles.primaryAction}
          />
        )}

        <Button
          title="Delete Account"
          onPress={() =>
            Alert.alert('Delete Account', 'This action is permanent.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive' },
            ])
          }
          variant="outline"
          style={styles.deleteButton}
          textStyle={styles.deleteButtonText}
        />

        <Button title="Logout" onPress={handleLogout} style={styles.logoutButton} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 200,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 72,
    paddingHorizontal: 32,
  },
  avatarWrapper: { position: 'absolute', top: 140, alignSelf: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: colors.background },
  cameraButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#f0f0f0', borderRadius: 20, padding: 6, borderWidth: 2, borderColor: '#fff' },
  profileMeta: { marginTop: 45, alignItems: 'center', gap: 6 },
  profileName: { color: colors.subtleText, fontSize: 18, fontWeight: '700' },
  profileEmail: { color: colors.surfaceAlt, textDecorationLine: 'underline' },
  editButton: { marginTop: 6, alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 6 },
  cardSection: { marginTop: 32, paddingHorizontal: 28, gap: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#6c6c6c33' },
  subscriptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  listItem: { fontSize: 16, color: colors.subtleText, fontWeight: '600', paddingVertical: 0 },
  primaryAction: { marginTop: 12 },
 deleteButton: { marginTop: 4, borderColor: colors.danger, borderWidth: 1.5, backgroundColor: colors.background },
  deleteButtonText: { color: colors.danger, fontWeight: '900' },
  logoutButton: { marginTop: 4 , backgroundColor: colors.danger, borderWidth: 0, },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.subtleText, fontSize: 16 },
});
