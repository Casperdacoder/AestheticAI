/* Real API client + design helpers for AestheticAI */

import axios from 'axios';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra;
const baseURL =
  extra?.apiBaseUrl?.replace(/\/+$/, '') || 'https://example.com'; // trim trailing slash

const api = axios.create({
  baseURL,
  timeout: 30000,
});

// Optional: small retry for flaky free-tier calls
api.interceptors.response.use(undefined, async (err) => {
  const cfg = err?.config;
  if (!cfg || cfg.__retried) throw err;
  // Retry once for 429/502
  if ([429, 502, 503].includes(err?.response?.status)) {
    cfg.__retried = true;
    await new Promise(r => setTimeout(r, 700));
    return api(cfg);
  }
  throw err;
});

/** Ensure we have a public HTTPS URL (upload file:// to Cloudinary if needed). */
export async function ensureHttpImageUrl(imageUri) {
  if (!imageUri) throw new Error('imageUri is required');
  if (/^https?:\/\//i.test(imageUri)) return imageUri; // already public

  // ---- Cloudinary unsigned upload (quick + free) ----
  // 1) Create an unsigned upload preset in Cloudinary dashboard.
  // 2) Fill these with your own cloud name + preset ID:
  const CLOUD_NAME = 'YOUR_CLOUD_NAME';
  const UPLOAD_PRESET = 'YOUR_UNSIGNED_PRESET';

  const form = new FormData();
  form.append('file', {
    uri: imageUri,
    name: 'upload.jpg',
    type: 'image/jpeg',
  });
  form.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const json = await res.json();
  return json.secure_url; // https://res.cloudinary...
}

/** Call your Vercel Vision-LLM endpoint to get design suggestions (Option A). */
export async function suggestDesign({ imageUri, budget = 'mid', stylePrefs = ['modern','cozy'] }) {
  if (!imageUri) throw new Error('imageUri is required');
  const imageUrl = await ensureHttpImageUrl(imageUri);

  const { data } = await api.post('/api/suggest-design', {
    imageUrl,
    budget,
    stylePrefs,
  });

  // Expected JSON per our /api/suggest-design contract
  return {
    ok: true,
    suggestions: data, // { roomSummary, roomTypeGuess, issuesFound, suggestions[], estimatedCostTier, shoppingList[] }
  };
}

/** Optional: if you also created /api/analyze-room (HF Places365 + Roboflow) */
export async function analyzeRoom({ imageUri }) {
  if (!imageUri) throw new Error('imageUri is required');
  const imageUrl = await ensureHttpImageUrl(imageUri);

  const { data } = await api.post('/api/analyze-room', { url: imageUrl });
  // { roomType, roomConfidence, hasWindow, windowConfidence, windowBoxes[] }
  return { ok: true, ...data };
}

/**
 * Replace your old stub. This now:
 * 1) (Optional) calls analyzeRoom for room/window signals
 * 2) calls suggestDesign for actionable tips + palette
 * 3) returns a merged payload your UI can render
 */
export async function generateLayout({ imageUri, roomType, measurements }) {
  try {
    // Optional: read detection first (uncomment if you added /api/analyze-room)
    // const detection = await analyzeRoom({ imageUri });

    const suggestion = await suggestDesign({
      imageUri,
      budget: 'mid',
      stylePrefs: ['minimal', 'cozy'],
    });

    // Produce a consistent object for your screens
    return {
      ok: true,
      // detection, // include if you called it
      layoutJson: {
        placements: [], // keep for future auto-layout
        notes: 'AI suggestions generated from image',
      },
      palette:
        suggestion?.suggestions?.color?.palette ||
        suggestion?.suggestions?.find?.(s => s.category === 'color')?.palette ||
        ['#A7C7E7', '#F4F1DE', '#81B29A'], // fallback if model omitted palette
      renderUrl: await ensureHttpImageUrl(imageUri), // you can keep original image as "render"
      suggestions: suggestion?.suggestions?.suggestions || suggestion?.suggestions || suggestion, // normalize
    };
  } catch (err) {
    console.warn('generateLayout error', err?.message);
    // Safe fallback (won’t crash UI)
    return {
      ok: false,
      error: err?.message || 'Generation failed',
      layoutJson: { placements: [], notes: 'Fallback' },
      palette: ['#A7C7E7', '#F4F1DE', '#81B29A'],
      renderUrl: imageUri,
    };
  }
}

export default api;
