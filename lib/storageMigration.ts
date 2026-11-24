// Moves data saved by versions that used AsyncStorage into MMKV. Keep this, and
// the AsyncStorage dependency, until no one is updating from those versions.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { storage } from "./mmkv";

const DONE_KEY = "asyncStorageMigrated";
const LEGACY_KEYS = ["userData", "appSettings", "devModeEnabled"];

/** Must finish before anything reads these keys. Never throws. */
export const migrateAsyncStorage = async (): Promise<void> => {
  if (storage.getBoolean(DONE_KEY)) return;
  try {
    for (const [key, value] of await AsyncStorage.multiGet(LEGACY_KEYS)) {
      if (value !== null && !storage.contains(key)) storage.set(key, value);
    }
    await AsyncStorage.multiRemove(LEGACY_KEYS);
    storage.set(DONE_KEY, true);
  } catch (error) {
    // Nothing is marked done, so the next start tries again.
    console.error("Error migrating saved data:", error);
  }
};
