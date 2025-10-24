import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const PROFILE_KEY_PREFIX = 'aestheticai:user-profile:';

// ✅ Save to local + Firestore
export async function saveProfile(uid, profile) {
  try {
    // Cache locally
    await AsyncStorage.setItem(`${PROFILE_KEY_PREFIX}${uid}`, JSON.stringify(profile));

    // Save to Firestore consultants collection
    await setDoc(doc(db, 'consultants', uid), profile, { merge: true });
  } catch (error) {
    console.warn('Failed to save profile', error);
  }
}

// ✅ Load profile from local
export async function loadProfile(uid) {
  try {
    const stored = await AsyncStorage.getItem(`${PROFILE_KEY_PREFIX}${uid}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load cached profile', error);
    return null;
  }
}

// ✅ Clear profile
export async function clearProfile(uid) {
  try {
    await AsyncStorage.removeItem(`${PROFILE_KEY_PREFIX}${uid}`);
  } catch (error) {
    console.warn('Failed to clear cached profile', error);
  }
}

// ✅ Fetch Firestore profile
export async function fetchProfileFromFirestore(uid) {
  try {
    const ref = doc(db, 'consultants', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.error('Error fetching profile from Firestore:', error);
    throw error;
  }
}
