// Tells the backend which device wants which mosque's push notifications.

import * as Notifications from "expo-notifications";
import { loadAppSettings } from "./appSettings";
import { getPushToken } from "./getPushToken";
import { storage } from "./mmkv";
import { loadPrayerNotificationSettings } from "./prayerNotifications";
import { loadUserData } from "./userData";

// Use this exact host. The bare domain and http:// both redirect, and Android
// release builds refuse plain http.
const PUSH_TOKEN_URL = "https://www.mymosque.app/api/pushToken";
const RECORD_KEY = "pushRegistration";
const TIMEOUT_MS = 10_000;

export type PushSyncResult = "sent" | "unchanged" | "skipped" | "failed";

let queue: Promise<unknown> = Promise.resolve();

/**
 * Sends the push token, mosque and preferences if they differ from the last
 * successful send. Safe to call often: failures are retried by the next call,
 * and calls are queued so each one sees the latest state.
 */
export const syncPushRegistration = (): Promise<PushSyncResult> => {
  const result = queue.then(sync).catch((error): PushSyncResult => {
    console.error("Error syncing push registration:", error);
    return "failed";
  });
  queue = result;
  return result;
};

const sync = async (): Promise<PushSyncResult> => {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return "skipped";

  const mosqueId = loadUserData().lastVisitedMosque;
  const pushToken = mosqueId ? await getPushToken() : null;
  if (!mosqueId || !pushToken) return "skipped";

  const body = JSON.stringify({
    pushToken,
    mosqueId,
    settings: {
      ...loadAppSettings(),
      prayer_times: { enabled: loadPrayerNotificationSettings().enabled },
    },
  });
  if (body === lastSentBody()) return "unchanged";

  if (!(await post(body))) return "failed";
  storage.set(
    RECORD_KEY,
    JSON.stringify({ body, sentAt: new Date().toISOString() }),
  );
  return "sent";
};

const lastSentBody = (): string | null => {
  try {
    const record = storage.getString(RECORD_KEY);
    return record ? JSON.parse(record).body : null;
  } catch {
    return null;
  }
};

const post = async (body: string): Promise<boolean> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(PUSH_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error("Push registration refused:", response.status);
    }
    return response.ok;
  } catch (error) {
    console.error("Error sending push registration:", error);
    return false;
  } finally {
    clearTimeout(timeout);
  }
};
