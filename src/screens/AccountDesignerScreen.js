import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, colors, Toast } from '../components/UI';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { loadProfile } from '../services/profileStore';

export default function AccountDesignerScreen({ navigation }) {
  const user = auth.currentUser;
  const [profile, setProfile] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const hydrateProfile = async () => {
      if (!user?.uid) return;
      const cachedProfile = await loadProfile(user.uid);
      if (isMounted) {
        setProfile({
          ...cachedProfile,
          email: cachedProfile?.email || user.email,
          name: cachedProfile?.name || user.displayName || 'Designer',
        });
      }
    };
    hydrateProfile();
    return () => { isMounted = false; };
  }, [user]);

  const showToast = (message, variant = 'info') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 2200);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            try {
              await signOut(auth); // ✅ now works
              navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
            } catch (error) {
              console.log("Logout error:", error);
              showToast("Failed to logout. Try again.", "error");
            }
          } 
        }
      ]
    );
  };

  const handleUpdateInformation = () => {
    navigation.navigate('UpdateInformation');
  };

  const handleSecurity = () => {
    navigation.navigate('Security');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action is permanent.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await user.delete();
              showToast("Account deleted!", "success");
              navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
            } catch (error) {
              showToast("Failed to delete account. Please re-login.", "error");
            }
          } 
        }
      ]
    );
  };

  if (!profile) {
    return (
      <Screen inset={false} style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </Screen>
    );
  }

  return (
    <ScrollView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      {toast && <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} />}

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
          onPress={handleUpdateInformation}
        >
          <Ionicons name="camera" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={styles.profileMeta}>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileEmail}>{profile.email}</Text>
      </View>

      {/* Account Options */}
      <View style={styles.cardSection}>
        <TouchableOpacity style={styles.subscriptionItem} onPress={handleUpdateInformation}>
          <Text style={styles.listItem}>Update Information</Text>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.subscriptionItem} onPress={handleSecurity}>
          <Text style={styles.listItem}>Security</Text>
          <Ionicons name="chevron-forward" size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <Button
          title="Delete Account"
          onPress={handleDeleteAccount}
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
  deleteButton: { marginTop: 4, borderColor: colors.danger, borderWidth: 1.5, backgroundColor: colors.background },
  deleteButtonText: { color: colors.danger, fontWeight: '900' },
  logoutButton: { marginTop: 4, backgroundColor: colors.danger, borderWidth: 0 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: colors.subtleText, fontSize: 16 },
});
