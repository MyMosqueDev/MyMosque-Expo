import AsyncStorage from "@react-native-async-storage/async-storage";
import { storage } from "./mmkv";

const KEY = "appSettings";

export type AppSettings = {
  events: { enabled: boolean };
  announcements: { enabled: boolean };
  development: { enabled: boolean };
};

export const DEFAULT_APP_SETTINGS: Readonly<AppSettings> = {
  events: { enabled: true },
  announcements: { enabled: true },
  development: { enabled: false },
};

/** Loads settings from MMKV, moving them from AsyncStorage the first time. */
export const loadAppSettings = async (): Promise<AppSettings> => {
  try {
    const saved = storage.getString(KEY) ?? (await migrate());
    if (saved) return { ...DEFAULT_APP_SETTINGS, ...JSON.parse(saved) };
  } catch (error) {
    console.error("Error loading settings:", error);
  }
  return { ...DEFAULT_APP_SETTINGS };
};

export const saveAppSettings = (settings: AppSettings): void =>
  storage.set(KEY, JSON.stringify(settings));

const migrate = async () => {
  const legacy = await AsyncStorage.getItem(KEY);
  if (legacy) storage.set(KEY, legacy);
  return legacy;
};
