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
//    (OK to keep both—hard-coded values ensure it works even if app.config.js is empty)
const fromInline = {
  apiKey: 'AIzaSyBbxHm7YPTc_sX0G0ZX4GrdBoYTPeqcBi0',
  authDomain: 'aesthetic-ai-c51b3.firebaseapp.com',
  projectId: 'aesthetic-ai-c51b3',
  // NOTE: storageBucket must use the appspot.com domain for Firebase Storage SDK
  storageBucket: 'aesthetic-ai-c51b3.appspot.com',
  messagingSenderId: '1007106239318',
  appId: '1:1007106239318:web:a311094bedb2c1d6f984f7',
  // measurementId is optional for analytics on web; harmless to include
  measurementId: 'G-2WYK40L0PC',
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
