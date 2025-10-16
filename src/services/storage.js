import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_DESIGNS_KEY = 'aestheticai:saved-designs';

export async function loadSavedDesigns() {
  try {
    const raw = await AsyncStorage.getItem(SAVED_DESIGNS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to load saved designs', error);
    return [];
  }
}

export async function saveDesign(design) {
  try {
    const existing = await loadSavedDesigns();
    const next = [
      { ...design, id: design.generatedAt || Date.now().toString() },
      ...existing
    ].slice(0, 20);
    await AsyncStorage.setItem(SAVED_DESIGNS_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    console.warn('Failed to save design', error);
    throw error;
  }
}

export async function clearDesigns() {
  await AsyncStorage.removeItem(SAVED_DESIGNS_KEY);
}


