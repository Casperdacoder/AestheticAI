import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 1) Try to read from app.config.js (optional)
const extra = Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {};
const fromExtra = extra?.firebase ?? {};

// 2) Hard-coded fallback to guarantee runtime configuration
const fallbackConfig = {
  apiKey: "AIzaSyBbxHm7YPTc_sX0G0ZX4GrdBoYTPeqcBi0",
  authDomain: "aesthetic-ai-c51b3.firebaseapp.com",
  projectId: "aesthetic-ai-c51b3",
  storageBucket: "aesthetic-ai-c51b3.appspot.com",
  messagingSenderId: "1007106239318",
  appId: "1:1007106239318:web:a311094bedb2c1d6f984f7",
  measurementId: "G-2WYK40L0PC"
};

// 3) Merge env/extra values over fallbacks
const firebaseConfig = { ...fallbackConfig, ...fromExtra };

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length) {
  console.warn(
    "[firebase] Missing configuration values:",
    missingKeys.join(", "),
    "- verify app.config.js extra.firebase or fallbackConfig."
  );
}


// 4) Init (guard against re-init)
const existingApps = getApps();
const app = existingApps.length ? existingApps[0] : initializeApp(firebaseConfig);

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

const firestoreSettings = {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: true,
  useFetchStreams: false
};

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, firestoreSettings);
} catch (firestoreInitError) {
  console.warn('Firestore falling back to default transport', firestoreInitError);
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export const storage = getStorage(app);
