import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const PROFILE_KEY_PREFIX = 'aestheticai:user-profile:';

const COLLECTION_BY_ROLE = {
  user: 'users',
  consultant: 'consultants',
  admin: 'admins'
};

function resolveCollection(role) {
  const normalizedRole = (role || '').toLowerCase();
  return COLLECTION_BY_ROLE[normalizedRole] || COLLECTION_BY_ROLE.user;
}

function normaliseForCache(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'object') {
    if (typeof value.toMillis === 'function') {
      return value.toMillis();
    }

    if (value._methodName === 'FieldValue.serverTimestamp') {
      return Date.now();
    }

    if (Array.isArray(value)) {
      return value.map((entry) => normaliseForCache(entry));
    }

    const result = {};
    for (const [key, entry] of Object.entries(value)) {
      result[key] = normaliseForCache(entry);
    }
    return result;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

async function cacheProfile(uid, profile) {
  const cacheReady = normaliseForCache(profile);
  await AsyncStorage.setItem(`${PROFILE_KEY_PREFIX}${uid}`, JSON.stringify(cacheReady));
}

export async function cacheProfileLocally(uid, profile) {
  if (!uid || !profile) return;
  try {
    await cacheProfile(uid, profile);
  } catch (error) {
    console.warn('Failed to cache profile locally', error);
  }
}

export async function saveProfile(uid, profile, roleOverride) {
  if (!uid || !profile) return;

  const resolvedRole = roleOverride || profile.role || 'user';
  const collection = resolveCollection(resolvedRole);
  const payload = { ...profile, role: resolvedRole };

  try {
    await cacheProfile(uid, payload);
  } catch (error) {
    console.warn('Failed to cache profile locally', error);
  }

  try {
    await setDoc(doc(db, collection, uid), payload, { merge: true });
  } catch (error) {
    console.warn(`Failed to save profile to ${collection}`, error);
    throw error;
  }
}

export async function loadProfile(uid) {
  if (!uid) return null;
  try {
    const stored = await AsyncStorage.getItem(`${PROFILE_KEY_PREFIX}${uid}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load cached profile', error);
    return null;
  }
}

export async function clearProfile(uid) {
  if (!uid) return;
  try {
    await AsyncStorage.removeItem(`${PROFILE_KEY_PREFIX}${uid}`);
  } catch (error) {
    console.warn('Failed to clear cached profile', error);
  }
}

export async function fetchProfileFromFirestore(uid, role) {
  if (!uid) return { profile: null, source: null, error: null };

  const preferredCollection = role ? resolveCollection(role) : null;
  const collections = [
    preferredCollection,
    COLLECTION_BY_ROLE.user,
    COLLECTION_BY_ROLE.consultant,
    COLLECTION_BY_ROLE.admin
  ].filter((value, index, array) => value && array.indexOf(value) === index);

  let lastError = null;

  for (const collection of collections) {
    try {
      const ref = doc(db, collection, uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() || {};
        const roleFromData = data.role || collection.replace(/s$/, '');
        const profile = normaliseForCache({ uid, ...data, role: roleFromData });
        await cacheProfile(uid, profile);
        return { profile, source: collection, error: null };
      }
    } catch (error) {
      lastError = error;
      if (error?.code === 'unavailable') {
        break;
      }
    }
  }

  return { profile: null, source: null, error: lastError };
}

export function getProfileCacheKey(uid) {
  return `${PROFILE_KEY_PREFIX}${uid}`;
}
