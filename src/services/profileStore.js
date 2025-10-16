import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_KEY_PREFIX = 'aestheticai:user-profile:';

export async function saveProfile(uid, profile) {
  try {
    await AsyncStorage.setItem(`${PROFILE_KEY_PREFIX}${uid}`, JSON.stringify(profile));
  } catch (error) {
    console.warn('Failed to cache profile', error);
  }
}

export async function loadProfile(uid) {
  try {
    const stored = await AsyncStorage.getItem(`${PROFILE_KEY_PREFIX}${uid}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load cached profile', error);
    return null;
  }
}

export async function clearProfile(uid) {
  try {
    await AsyncStorage.removeItem(`${PROFILE_KEY_PREFIX}${uid}`);
  } catch (error) {
    console.warn('Failed to clear cached profile', error);
  }
}
