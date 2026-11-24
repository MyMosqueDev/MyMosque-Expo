// Prayer Time Push Notifications
// Handles local scheduling of prayer time notifications using Expo Notifications

import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { normalizeJummah } from "./jummah";
import { storage } from "./mmkv";
import {
  getJummahSlots,
  getTimesForDate,
  isFriday,
  isKnownTime,
} from "./prayerTimeUtils";
import { DBPrayerTimes, JummahTime } from "./types";
import { to24HourFormat } from "./utils";

// Storage key for prayer notification settings
export const PRAYER_NOTIFICATION_STORAGE_KEY = "prayerNotificationSettings";

// Prefix for notification identifiers (for easy cancellation)
export const PRAYER_NOTIFICATION_PREFIX = "prayer-notification";

// iOS has a limit of 64 scheduled notifications
// We reserve the last slot for a reminder to re-open the app
const IOS_NOTIFICATION_LIMIT = 64;
const IOS_PRAYER_NOTIFICATION_LIMIT = IOS_NOTIFICATION_LIMIT - 1; // 63 prayer notifications + 1 reminder

// How far ahead to schedule. Days past the stored month reuse its last known day
// until the next schedule is downloaded, so reminders never stop at month end.
const HORIZON_DAYS = 31;

const EARLY_REMINDER_MS = 15 * 60 * 1000;

// Types
export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export type PrayerNotificationSettings = {
  enabled: boolean;
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  jummah: {
    jummah1: boolean;
    jummah2: boolean;
    jummah3: boolean;
  };
};

export const DEFAULT_PRAYER_NOTIFICATION_SETTINGS: PrayerNotificationSettings =
  {
    enabled: false,
    prayers: {
      fajr: true,
      dhuhr: true,
      asr: true,
      maghrib: true,
      isha: true,
    },
    jummah: {
      jummah1: true,
      jummah2: true,
      jummah3: true,
    },
  };

// Storage helpers
export const loadPrayerNotificationSettings =
  (): PrayerNotificationSettings => {
    try {
      const settingsString = storage.getString(PRAYER_NOTIFICATION_STORAGE_KEY);
      if (settingsString) {
        return JSON.parse(settingsString);
      }
    } catch (error) {
      console.error("Error loading prayer notification settings:", error);
    }
    return DEFAULT_PRAYER_NOTIFICATION_SETTINGS;
  };

export const savePrayerNotificationSettings = (
  settings: PrayerNotificationSettings,
): void => {
  try {
    storage.set(PRAYER_NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving prayer notification settings:", error);
  }
};

// Cancel all prayer notifications
export const cancelAllPrayerNotifications = async (): Promise<void> => {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    const prayerNotifications = scheduledNotifications.filter((notification) =>
      notification.identifier.startsWith(PRAYER_NOTIFICATION_PREFIX),
    );

    await Promise.all(
      prayerNotifications.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier),
      ),
    );

    console.log(`Cancelled ${prayerNotifications.length} prayer notifications`);
  } catch (error) {
    console.error("Error cancelling prayer notifications:", error);
  }
};

// Helper to format prayer name for display
const formatPrayerName = (prayerName: string): string => {
  const nameMap: Record<string, string> = {
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    jummah1: "Jummah",
    jummah2: "Jummah 2",
    jummah3: "Jummah 3",
  };
  return nameMap[prayerName] || prayerName;
};

// The given day at a "1:30 PM" or "13:30" time
const atTime = (day: Date, time: string): Date => {
  const [hours, minutes] = to24HourFormat(time).split(":").map(Number);
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    hours,
    minutes,
  );
};

// Used in identifiers, so it must be unique across the whole horizon
const dateId = (day: Date) =>
  [
    day.getFullYear(),
    String(day.getMonth() + 1).padStart(2, "0"),
    String(day.getDate()).padStart(2, "0"),
  ].join("-");

// Type for pending notification to be scheduled
type PendingNotification = {
  identifier: string;
  title: string;
  body: string;
  date: Date;
  data: Record<string, any>;
};

// Schedule a single notification
const scheduleNotification = async (
  notification: PendingNotification,
): Promise<void> => {
  const { identifier, title, body, date, data } = notification;

  // Don't schedule notifications in the past
  if (date <= new Date()) {
    return;
  }

  try {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title,
        body,
        sound: true,
        data: {
          ...data,
          type: "prayer",
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
    });
  } catch (error) {
    console.error(`Error scheduling notification ${identifier}:`, error);
  }
};

// Runs are queued: overlapping runs could otherwise interleave cancelling and
// scheduling, and an older run could undo a newer change.
let queue: Promise<void> = Promise.resolve();

// Main function to schedule prayer notifications
export const schedulePrayerNotifications = (
  mosqueId: string,
  mosqueName: string,
): Promise<void> => {
  queue = queue.then(() => reschedule(mosqueId, mosqueName));
  return queue;
};

const reschedule = async (
  mosqueId: string,
  mosqueName: string,
): Promise<void> => {
  try {
    const settings = loadPrayerNotificationSettings();
    await cancelAllPrayerNotifications();
    if (!settings.enabled) return;

    const mosqueDataString = storage.getString(`mosqueData-${mosqueId}`);
    if (!mosqueDataString) {
      console.log("No mosque data found for scheduling notifications");
      return;
    }

    const mosqueData = JSON.parse(mosqueDataString);
    const schedule: DBPrayerTimes | null = mosqueData.monthlyPrayerSchedule;
    if (!schedule?.prayer_times?.length) {
      console.log("No monthly prayer schedule found");
      return;
    }

    const pending = buildNotifications(
      mosqueId,
      mosqueName,
      settings,
      schedule,
      normalizeJummah(mosqueData.jummahTimes),
    );

    const limited =
      Platform.OS === "ios" && pending.length > IOS_PRAYER_NOTIFICATION_LIMIT;
    const toSchedule = limited
      ? pending.slice(0, IOS_PRAYER_NOTIFICATION_LIMIT)
      : pending;

    for (const notification of toSchedule) {
      await scheduleNotification(notification);
    }

    // On iOS the 64th slot asks the user to reopen the app for more
    if (limited) {
      const last = toSchedule[toSchedule.length - 1];
      await scheduleNotification({
        identifier: `${PRAYER_NOTIFICATION_PREFIX}-${mosqueId}-reminder`,
        title: "Prayer Notifications",
        body: `Open ${mosqueName} to continue receiving prayer time notifications`,
        date: new Date(last.date.getTime() + 60 * 1000),
        data: { mosqueId, notificationType: "reminder" },
      });
    }

    console.log(
      `Scheduled ${toSchedule.length} prayer notifications for ${mosqueName}${limited ? " (iOS limit applied)" : ""}`,
    );
  } catch (error) {
    console.error("Error scheduling prayer notifications:", error);
  }
};

// Every future reminder within the horizon, earliest first
const buildNotifications = (
  mosqueId: string,
  mosqueName: string,
  settings: PrayerNotificationSettings,
  schedule: DBPrayerTimes,
  jummahTimes: JummahTime | null,
): PendingNotification[] => {
  const now = new Date();
  const pending: PendingNotification[] = [];

  const add = (
    day: Date,
    prayer: string,
    iqamaTime: string,
    early: { title: string; body: string },
    iqama: { title: string; body: string },
  ) => {
    const iqamaDate = atTime(day, iqamaTime);
    const earlyDate = new Date(iqamaDate.getTime() - EARLY_REMINDER_MS);
    const id = `${PRAYER_NOTIFICATION_PREFIX}-${mosqueId}-${dateId(day)}-${prayer}`;
    for (const { type, date, content } of [
      { type: "15min", date: earlyDate, content: early },
      { type: "iqama", date: iqamaDate, content: iqama },
    ]) {
      if (date > now) {
        pending.push({
          identifier: `${id}-${type}`,
          ...content,
          date,
          data: { prayer, mosqueId, notificationType: type },
        });
      }
    }
  };

  for (let offset = 0; offset < HORIZON_DAYS; offset++) {
    const day = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
    );
    const times = getTimesForDate(schedule, day);
    const jummah = isFriday(day)
      ? getJummahSlots(jummahTimes).filter(({ key }) => settings.jummah[key])
      : [];

    for (const prayer of Object.keys(settings.prayers) as PrayerName[]) {
      const iqama = times[prayer]?.iqama;
      if (!settings.prayers[prayer] || !isKnownTime(iqama)) continue;
      // Jummah takes the place of Dhuhr
      if (prayer === "dhuhr" && jummah.length > 0) continue;

      const name = formatPrayerName(prayer);
      add(
        day,
        prayer,
        iqama,
        {
          title: `15 minutes until ${name}`,
          body: `${name} iqama at ${mosqueName}`,
        },
        {
          title: `${name} at ${mosqueName}`,
          body: `Iqama time for ${name}`,
        },
      );
    }

    for (const { key, iqama } of jummah) {
      const name = formatPrayerName(key);
      add(
        day,
        key,
        iqama,
        {
          title: mosqueName,
          body: `15 minutes until ${name} at ${mosqueName}`,
        },
        { title: mosqueName, body: `Time for ${name} at ${mosqueName}` },
      );
    }
  }

  return pending.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// Get the number of Jummah prayers for a mosque
export const getJummahCount = (jummahTimes: JummahTime | null): number => {
  if (!jummahTimes) return 0;
  let count = 0;
  if (jummahTimes.jummah1) count++;
  if (jummahTimes.jummah2) count++;
  if (jummahTimes.jummah3) count++;
  return count;
};
