// Prayer Time Push Notifications
// Handles local scheduling of prayer time notifications using Expo Notifications

import * as Notifications from "expo-notifications";
import { storage } from "./mmkv";
import { DBPrayerTimes, JummahTime } from "./types";
import { to24HourFormat } from "./utils";

// Storage key for prayer notification settings
export const PRAYER_NOTIFICATION_STORAGE_KEY = "prayerNotificationSettings";

// Prefix for notification identifiers (for easy cancellation)
export const PRAYER_NOTIFICATION_PREFIX = "prayer-notification";

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

export const DEFAULT_PRAYER_NOTIFICATION_SETTINGS: PrayerNotificationSettings = {
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
export const loadPrayerNotificationSettings = (): PrayerNotificationSettings => {
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
  settings: PrayerNotificationSettings
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
      notification.identifier.startsWith(PRAYER_NOTIFICATION_PREFIX)
    );

    await Promise.all(
      prayerNotifications.map((notification) =>
        Notifications.cancelScheduledNotificationAsync(notification.identifier)
      )
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

// Helper to parse time string to hours and minutes
const parseTime = (timeStr: string): { hours: number; minutes: number } => {
  const time24 = to24HourFormat(timeStr);
  const [hours, minutes] = time24.split(":").map(Number);
  return { hours, minutes };
};

// Helper to subtract minutes from a time
const subtractMinutes = (
  hours: number,
  minutes: number,
  minutesToSubtract: number
): { hours: number; minutes: number } => {
  let totalMinutes = hours * 60 + minutes - minutesToSubtract;
  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // Handle going to previous day
  }
  return {
    hours: Math.floor(totalMinutes / 60) % 24,
    minutes: totalMinutes % 60,
  };
};

// Schedule a single notification
const scheduleNotification = async (
  identifier: string,
  title: string,
  body: string,
  date: Date,
  data: Record<string, any>
): Promise<void> => {
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

// Main function to schedule prayer notifications
export const schedulePrayerNotifications = async (
  mosqueId: string,
  mosqueName: string
): Promise<void> => {
  try {
    // Load settings
    const settings = loadPrayerNotificationSettings();
    
    // If notifications are disabled, cancel all and return
    if (!settings.enabled) {
      await cancelAllPrayerNotifications();
      return;
    }

    // Cancel existing notifications before scheduling new ones
    await cancelAllPrayerNotifications();

    // Load monthly prayer schedule from MMKV
    const mosqueDataString = storage.getString(`mosqueData-${mosqueId}`);
    if (!mosqueDataString) {
      console.log("No mosque data found for scheduling notifications");
      return;
    }

    const mosqueData = JSON.parse(mosqueDataString);
    const monthlySchedule: DBPrayerTimes | null = mosqueData.monthlyPrayerSchedule;
    const jummahTimes: JummahTime | null = mosqueData.jummahTimes;

    if (!monthlySchedule || !monthlySchedule.prayer_times) {
      console.log("No monthly prayer schedule found");
      return;
    }

    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Schedule for remaining days of the month
    const prayersToSchedule: PrayerName[] = (
      Object.keys(settings.prayers) as PrayerName[]
    ).filter((prayer) => settings.prayers[prayer]);

    let scheduledCount = 0;

    for (let dayIndex = currentDay - 1; dayIndex < monthlySchedule.prayer_times.length; dayIndex++) {
      const dayData = monthlySchedule.prayer_times[dayIndex];
      const dayOfMonth = parseInt(dayData.day, 10);
      const isFriday = new Date(currentYear, currentMonth, dayOfMonth).getDay() === 5;

      // Schedule regular prayers (skip Dhuhr on Fridays if Jummah is enabled)
      for (const prayer of prayersToSchedule) {
        // Skip Dhuhr on Fridays if any Jummah is enabled
        if (prayer === "dhuhr" && isFriday && Object.values(settings.jummah).some(Boolean)) {
          continue;
        }

        const prayerTime = dayData.times[prayer];
        if (!prayerTime || !prayerTime.iqama) continue;

        const { hours, minutes } = parseTime(prayerTime.iqama);

        // Schedule 15 minutes before iqama
        const before15 = subtractMinutes(hours, minutes, 15);
        const date15Before = new Date(currentYear, currentMonth, dayOfMonth, before15.hours, before15.minutes);
        
        await scheduleNotification(
          `${PRAYER_NOTIFICATION_PREFIX}-${mosqueId}-${dayOfMonth}-${prayer}-15min`,
          `15 minutes until ${formatPrayerName(prayer)}`,
          `${formatPrayerName(prayer)} iqama at ${mosqueName}`,
          date15Before,
          { prayer, mosqueId, notificationType: "15min" }
        );

        // Schedule at iqama time
        const dateIqama = new Date(currentYear, currentMonth, dayOfMonth, hours, minutes);
        
        await scheduleNotification(
          `${PRAYER_NOTIFICATION_PREFIX}-${mosqueId}-${dayOfMonth}-${prayer}-iqama`,
          `${formatPrayerName(prayer)} at ${mosqueName}`,
          `Iqama time for ${formatPrayerName(prayer)}`,
          dateIqama,
          { prayer, mosqueId, notificationType: "iqama" }
        );

        scheduledCount += 2;
      }

      // Schedule Jummah on Fridays
      if (isFriday && jummahTimes) {
        const jummahEntries: Array<{ key: keyof typeof settings.jummah; data: { athan: string; iqama: string } | undefined }> = [
          { key: "jummah1", data: jummahTimes.jummah1 },
          { key: "jummah2", data: jummahTimes.jummah2 },
          { key: "jummah3", data: jummahTimes.jummah3 },
        ];

        for (const { key, data } of jummahEntries) {
          if (!settings.jummah[key] || !data || !data.iqama) continue;

          const { hours, minutes } = parseTime(data.iqama);

          // Schedule 15 minutes before iqama
          const before15 = subtractMinutes(hours, minutes, 15);
          const date15Before = new Date(currentYear, currentMonth, dayOfMonth, before15.hours, before15.minutes);
          
          await scheduleNotification(
            `${PRAYER_NOTIFICATION_PREFIX}-${mosqueId}-${dayOfMonth}-${key}-15min`,
            `${mosqueName}`,
            `15 minutes until ${formatPrayerName(key)} at ${mosqueName}`,
            date15Before,
            { prayer: key, mosqueId, notificationType: "15min" }
          );

          // Schedule at iqama time
          const dateIqama = new Date(currentYear, currentMonth, dayOfMonth, hours, minutes);
          
          await scheduleNotification(
            `${PRAYER_NOTIFICATION_PREFIX}-${mosqueId}-${dayOfMonth}-${key}-iqama`,
            `${mosqueName}`,
            `Time for ${formatPrayerName(key)} at ${mosqueName}`,
            dateIqama,
            { prayer: key, mosqueId, notificationType: "iqama" }
          );

          scheduledCount += 2;
        }
      }
    }

    console.log(`Scheduled ${scheduledCount} prayer notifications for ${mosqueName}`);
  } catch (error) {
    console.error("Error scheduling prayer notifications:", error);
  }
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
