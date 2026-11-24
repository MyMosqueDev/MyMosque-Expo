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

export const loadAppSettings = (): AppSettings => {
  try {
    return {
      ...DEFAULT_APP_SETTINGS,
      ...JSON.parse(storage.getString(KEY) ?? "{}"),
    };
  } catch (error) {
    console.error("Error loading settings:", error);
    return { ...DEFAULT_APP_SETTINGS };
  }
};

export const saveAppSettings = (settings: AppSettings): void =>
  storage.set(KEY, JSON.stringify(settings));
