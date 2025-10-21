// app.config.js
import 'dotenv/config';

export default {
  expo: {
    name: "AestheticAI",
    slug: "aestheticaiexpo",
    scheme: "aestheticai",

    plugins: [
      [
        'expo-image-picker',
        {
          photosPermission:
            'Allow AestheticAI to access your design photos to generate custom layouts.',
          cameraPermission:
            'Allow AestheticAI to use your camera for capturing room photos.',
          microphonePermission: false,
        },
      ],
    ],

    icon: './assets/icon.png',
    splash: {
      image: './assets/logo.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    ios: {
      infoPlist: {
        NSCameraUsageDescription:
          'Allow AestheticAI to use your camera to capture room photos.',
        NSPhotoLibraryUsageDescription:
          'Allow AestheticAI to access your gallery for design images.',
        NSPhotoLibraryAddUsageDescription:
          'Allow AestheticAI to save generated designs to your photo library.',
      },
    },

    android: {
      adaptiveIcon: {
        icon: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'READ_MEDIA_IMAGES',
      ],
      package: 'com.mcclien.aestheticaiexpo',
    },

    assetBundlePatterns: ['**/*'],

    // EAS Update
    updates: {
      url: 'https://u.expo.dev/e34071e2-f237-4975-a8a9-354d342d5e59',
      checkAutomatically: 'ON_LOAD',
      fallbackToCacheTimeout: 0,
    },

    runtimeVersion: { policy: 'appVersion' },

    extra: {
      // Public base URL for your own backend
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,

      // Firebase
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      },

      // Hugging Face
      huggingface: {
        token: process.env.HUGGINGFACE_TOKEN,
        imageModel:
          process.env.HUGGINGFACE_IMAGE_MODEL ||
          'Salesforce/blip-image-captioning-base',
        textModel:
          process.env.HUGGINGFACE_TEXT_MODEL ||
          'HuggingFaceH4/zephyr-7b-beta',
      },

      // Google Vision
      googleVision: {
        apiKey: process.env.GOOGLE_VISION_API_KEY,
      },

      // EAS project
      eas: {
        projectId: 'e34071e2-f237-4975-a8a9-354d342d5e59',
      },
    },
  },
};
