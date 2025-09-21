import axios from 'axios';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra;
const api = axios.create({
  baseURL: extra?.apiBaseUrl || 'https://example.com',
  timeout: 30000
});

// Stub for now — replace with your real AI endpoint later.
export async function generateLayout({ imageUri, roomType, measurements }) {
  return {
    ok: true,
    layoutJson: { placements: [], notes: 'Sample only' },
    palette: ['#A7C7E7', '#F4F1DE', '#81B29A'],
    renderUrl: imageUri
  };
}

export default api;

