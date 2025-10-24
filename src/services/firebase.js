import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 1) Try to read from app.config.js (optional)
const extra = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {};
const fromExtra = extra?.firebase ?? {};

// 2) Hard-coded fallback (your real Web config)
//    (OK to keep both—hard-coded values ensursse it works even if app.config.js is empty)
const fromInline = {
  apiKey: "AIzaSyAFdW-wIHdpci42YcngOBP-hhACBKGvW1Y",
  authDomain: "aestheticai-c3795.firebaseapp.com",
  projectId: "aestheticai-c3795",
storageBucket: "aestheticai-c3795.appspot.com",
  messagingSenderId: "873025464768",
  appId: "1:873025464768:android:49bb9dffb2f52f1aafc025"
};

// 3) Merge (values in fromInline win over fromExtra to avoid missing keys)
const firebaseConfig = { ...fromExtra, ...fromInline };


// 4) Init (guard against re-init)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

let auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    } catch (error) {
      auth = getAuth(app);
    }
}

export { auth };
export const db = getFirestore(app);
export const storage = getStorage(app);
