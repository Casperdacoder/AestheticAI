/* NOTE: The photo 'scan' logic is still a no-op - it never sees the actual pixels, so anything from a notebook to a selfie looks like a generic room, and the customization flow keeps falling back to the same interior template. Every attempt to patch it has been stymied because the project doesn't have a real vision service wired up (there isn't even local Python on this machine), so the analyzeRoomPhoto stub remains. Until you add a backend that can detect whether an image is an interior - or otherwise provide stronger heuristics - the app will keep returning that canned room design regardless of what you upload. */
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



