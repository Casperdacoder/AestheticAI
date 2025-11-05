import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import Constants from 'expo-constants';
import BASE from '../config/apiBase';

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra;

const api = axios.create({
  baseURL: extra?.apiBaseUrl || BASE,
  timeout: 30000
});

function detectMimeType(uri) {
  if (!uri) return 'image/jpeg';
  const normalized = uri.split('?')[0].toLowerCase();
  if (normalized.endsWith('.png')) return 'image/png';
  if (normalized.endsWith('.webp')) return 'image/webp';
  if (normalized.endsWith('.heic') || normalized.endsWith('.heif')) return 'image/heic';
  if (normalized.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

export async function generateLayout({ imageUri, prompt, roomType, measurements } = {}) {
  let cleanupUri = null;

  try {
    let imageBase64 = null;
    let mimeType = detectMimeType(imageUri);

    if (imageUri) {
      let localUri = imageUri;

      if (imageUri.startsWith('http')) {
        const target = `${FileSystem.cacheDirectory}hf-${Date.now()}.img`;
        const download = await FileSystem.downloadAsync(imageUri, target);
        localUri = download.uri;
        cleanupUri = download.uri;
        mimeType = download.headers?.['Content-Type'] || mimeType;
      }

      const base64Encoding = FileSystem?.EncodingType?.Base64 ?? 'base64';
      imageBase64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: base64Encoding
      });
    }

    const payload = {
      prompt: prompt || '',
      roomType: roomType || null,
      measurements: measurements || null,
      imageBase64,
      imageMimeType: mimeType
    };

    const response = await api.post('/api/hf/layout', payload);
    if (!response.data?.success) {
      throw new Error(response.data?.error || 'Layout generation failed');
    }

    return response.data;
  } catch (error) {
    console.warn('generateLayout error', error);
    throw error;
  } finally {
    if (cleanupUri) {
      try {
        await FileSystem.deleteAsync(cleanupUri, { idempotent: true });
      } catch (cleanupError) {
        console.warn('Failed to clean up temp image', cleanupError);
      }
    }
  }
}

export default api;
