import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { Screen, Button, ListRow, Toast, colors } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { cacheUserRole, getCachedUserRole } from '../services/userCache';
import { loadProfile } from '../services/profileStore';

const designerFields = [
  { label: 'Full name', key: 'name', fallback: 'Designer Name' },
  { label: 'Education', key: 'education', fallback: 'Architecture - FEU, 2023' },
  { label: 'Experience', key: 'experience', fallback: '2 years' },
  { label: 'Specialization / Expertise', key: 'expertise', fallback: 'Modern, Minimalist' },
  { label: 'Location', key: 'location', fallback: 'Quezon City, Philippines' },
  { label: 'Schedule / Availability', key: 'availability', fallback: 'Mon, Thu, Wed' },
  { label: 'Portfolio', key: 'portfolio', fallback: 'Upload portfolio.pdf' }
];

const VERIFICATION_MESSAGES = {
  pending: {
    title: 'Verification Status: Pending Review',
    body: 'Your profile is under review. You will be notified once approved or if more information is required.'
  },
  rejected: {
    title: 'Verification Status: Rejected',
    body: 'Your portfolio did not meet our requirements. Update your information and resubmit.'
  },
  verified: {
    title: 'Verification Status: Verified',
    body: 'Congratulations! Your profile has been verified. You now have full access to the Designer Dashboard.'
  }
};

export default function AccountScreen({ navigation }) {
  const user = auth.currentUser;
  const email = user?.email || 'example@gmail.com';
  const [profile, setProfile] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const hydrateProfile = async () => {
      if (!user?.uid) return;
      const cachedProfile = await loadProfile(user.uid);
      if (isMounted) {
        if (cachedProfile) {
          setProfile({ ...cachedProfile, email: cachedProfile.email || email });
          await cacheUserRole(user.uid, cachedProfile.role || 'user');
        } else {
          setProfile({ role: await getCachedUserRole(user.uid) || 'user', name: 'Name', email });
        }
      }
    };
    hydrateProfile();
    return () => {
      isMounted = false;
    };
  }, [user, email]);

  const isDesigner = (profile?.role || 'user') === 'designer';

  const showToast = (message, variant = 'info') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 2200);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
  };

  if (!profile) {
    return (
      <Screen inset={false} style={styles.screen}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.loading}>Loading profile...</Text>
      </Screen>
    );
  }

  if (!isDesigner) {
    return (
      <Screen inset={false} style={styles.screen}>
        <StatusBar barStyle="light-content" />
        {toast ? (
          <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} />
        ) : null}
        <View style={styles.hero}>
          <Ionicons name="notifications-outline" size={22} color={colors.primaryText} style={styles.heroIcon} />
          <Text style={styles.heroGreeting}>Welcome back!</Text>
        </View>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatar} />
        </View>

        <View style={styles.profileMeta}>
          <Text style={styles.profileName}>{profile.name || 'Name'}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <Button
            title="Edit"
            variant="secondary"
            onPress={() => navigation.navigate('ProfileEdit')}
            style={styles.editButton}
          />
        </View>

        <View style={styles.cardSection}>
          <ListRow label="Change Password" onPress={() => navigation.navigate('Security')} />
          <View style={styles.divider} />
          <ListRow
            label="Subscription"
            helper="Plan: Free"
            onPress={() => navigation.navigate('ManageSubscription')}
            rightIcon="chevron-down"
          />

          <Button
            title="Update to Premium"
            onPress={() => navigation.navigate('Payment')}
            style={styles.primaryAction}
          />

          <Button
            title="Delete Account"
            onPress={() => Alert.alert('Delete Account', 'This action is permanent.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive' }
            ])}
            variant="outline"
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />

          <Button title="Logout" onPress={handleLogout} style={styles.logoutButton} />
        </View>
      </Screen>
    );
  }

  const verification = profile.verificationStatus || 'pending';
  const verificationCopy = VERIFICATION_MESSAGES[verification] || VERIFICATION_MESSAGES.pending;

  return (
    <Screen inset={false} style={styles.screen}>
      <StatusBar barStyle="light-content" />
      {toast ? (
        <Toast visible text={toast.message} onClose={() => setToast(null)} variant={toast.variant} />
      ) : null}
      <ScrollView contentContainerStyle={designerStyles.scroll} showsVerticalScrollIndicator={false}>
        <View style={designerStyles.heroCard}>
          <View style={designerStyles.heroRow}>
            <View style={designerStyles.avatarLarge}>
              <Ionicons name="camera-outline" size={28} color={colors.mutedAlt} />
            </View>
            <View style={designerStyles.heroInfo}>
              <Text style={designerStyles.heroName}>{profile.name || 'Name'}</Text>
              <TouchableOpacity onPress={() => showToast('Copy email feature coming soon.')}>
                <Text style={designerStyles.heroEmail}>{email}</Text>
              </TouchableOpacity>
            </View>
            <Text style={designerStyles.verified}>Verified</Text>
          </View>
        </View>

        <View style={designerStyles.sectionBlock}>
          <Text style={designerStyles.sectionHeading}>Account Settings</Text>
          <TouchableOpacity onPress={() => showToast('Designer profile editing coming soon.')} activeOpacity={0.7}>
            <Text style={designerStyles.sectionLink}>Update Information</Text>
          </TouchableOpacity>
          <View style={designerStyles.sectionDivider} />

          {designerFields.map((field) => (
            <View key={field.key} style={designerStyles.infoRow}>
              <Text style={designerStyles.infoLabel}>{field.label}</Text>
              <Text style={designerStyles.infoValue}>{profile[field.key] || field.fallback}</Text>
            </View>
          ))}

          <Button
            title="Edit"
            variant="outline"
            style={designerStyles.editButton}
            textStyle={designerStyles.editButtonText}
            onPress={() => showToast('Edit profile coming soon.', 'info')}
          />
        </View>

        <View style={designerStyles.sectionBlock}>
          <Text style={designerStyles.sectionHeading}>Security</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Security')}>
            <Text style={designerStyles.sectionLink}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => showToast('QR upload coming soon.')} style={{ marginTop: 12 }}>
            <Text style={designerStyles.sectionLink}>Update GCash QR</Text>
          </TouchableOpacity>
          <View style={designerStyles.sectionDivider} />
        </View>

        <View style={designerStyles.sectionBlock}>
          <Text style={designerStyles.sectionHeading}>{verificationCopy.title}</Text>
          <Text style={designerStyles.sectionBody}>{verificationCopy.body}</Text>
          {verification === 'rejected' ? (
            <Button
              title="Resubmit Verification"
              onPress={() => showToast('Verification resubmission coming soon.', 'info')}
              style={designerStyles.primaryAction}
            />
          ) : null}
        </View>

        <Button title="Logout" onPress={handleLogout} style={designerStyles.logoutButton} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background
  },
  hero: {
    height: 200,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingTop: 72,
    paddingHorizontal: 32
  },
  heroIcon: {
    alignSelf: 'flex-end'
  },
  heroGreeting: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 28
  },
  avatarWrapper: {
    position: 'absolute',
    top: 140,
    alignSelf: 'center',
    backgroundColor: colors.background,
    padding: 6,
    borderRadius: 999
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#D9D9D9',
    borderWidth: 4,
    borderColor: colors.background
  },
  profileMeta: {
    marginTop: 120,
    alignItems: 'center',
    gap: 6
  },
  profileName: {
    color: colors.subtleText,
    fontSize: 18,
    fontWeight: '700'
  },
  profileEmail: {
    color: colors.accent,
    textDecorationLine: 'underline'
  },
  editButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 30
  },
  cardSection: {
    marginTop: 32,
    paddingHorizontal: 28,
    gap: 16
  },
  divider: {
    height: 1,
    backgroundColor: colors.outline,
    opacity: 0.5
  },
  primaryAction: {
    marginTop: 12
  },
  deleteButton: {
    marginTop: 4,
    borderColor: colors.danger,
    borderWidth: 1.5,
    backgroundColor: 'rgba(210,74,67,0.12)'
  },
  deleteButtonText: {
    color: colors.danger
  },
  logoutButton: {
    marginTop: 4
  },
  loading: {
    color: colors.subtleText,
    textAlign: 'center',
    marginTop: 120
  }
});

const designerStyles = StyleSheet.create({
  scroll: {
    paddingBottom: 120,
    paddingHorizontal: 24,
    gap: 28
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    gap: 18
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroInfo: {
    flex: 1,
    marginLeft: 16,
    gap: 6
  },
  heroName: {
    color: colors.primaryText,
    fontSize: 20,
    fontWeight: '700'
  },
  heroEmail: {
    color: colors.accent,
    textDecorationLine: 'underline'
  },
  verified: {
    color: '#7CE577',
    fontWeight: '600'
  },
  sectionBlock: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    gap: 18,
    borderWidth: 1,
    borderColor: colors.outline
  },
  sectionHeading: {
    color: colors.subtleText,
    fontWeight: '700',
    fontSize: 18
  },
  sectionLink: {
    color: colors.subtleText,
    fontWeight: '600'
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.outline,
    marginTop: 12
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  infoLabel: {
    color: colors.subtleText,
    fontWeight: '600',
    flex: 1
  },
  infoValue: {
    color: colors.subtleText,
    flex: 1,
    textAlign: 'right'
  },
  editButton: {
    alignSelf: 'center',
    width: 160,
    borderColor: '#4FAF5A'
  },
  editButtonText: {
    color: '#4FAF5A'
  },
  sectionBody: {
    color: colors.subtleText,
    lineHeight: 20
  },
  primaryAction: {
    marginTop: 4
  },
  logoutButton: {
    alignSelf: 'center',
    width: '60%'
  }
});

