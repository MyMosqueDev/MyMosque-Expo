// this file deals wih all the syncing of data between the db and the local storage
// if a user visits a mosque, we need to sync the data from the db to the local storage
// if it's their first time visiting, we need to get all the data from the db
// if it's not their first time visiting, we need to get the data from the db that has changed since the last time they visited
// this is done by checking the last_event, last_announcement, and last_prayer times and comparing them to their database counterparts
// if the last_x stored in the local storage is older than the last_x in the db, we need to get the data from the db
// this is done by checking the last_event, last_announcement, and last_prayer times and comparing them to their database counterparts
// prayer times are also synced daily at midnight to ensure fresh prayer times for each new day

import { storage } from "./mmkv";
import {
  loadPrayerNotificationSettings,
  schedulePrayerNotifications,
} from "./prayerNotifications";
import { getCurrentPrayerTime } from "./prayerTimeUtils";
import { supabase } from "./supabase";
import {
  DBPrayerTimes,
  JummahTime,
  MosqueData,
  PrayerTime,
  ProcessedMosqueData,
} from "./types";

// syncs the local storage with the db & returns all mosque info
/**
 * syncs the local storage with the db & returns all mosque info
 * @param lastVisitedMosqueId - the id of the mosque to sync
 * @returns the mosque data
 */
export const syncStorage = async (lastVisitedMosqueId: string) => {
  const dbMosqueData = await getMosqueData(lastVisitedMosqueId); // gets the mosque data from the db

  if (!dbMosqueData) {
    throw new Error(`Mosque with ID ${lastVisitedMosqueId} not found`);
  }
  const jummahTimes: JummahTime = dbMosqueData.jummah_times;
  const prayerSettings = dbMosqueData.prayer_settings;

  // gets the mosque data from the local storage
  const storageData = storage.getString(`mosqueData-${lastVisitedMosqueId}`);
  const storageMosqueData = storageData ? JSON.parse(storageData) : null;

  // first time visiting this mosque, so we need to get all the data from the db
  if (!storageMosqueData || Object.keys(storageMosqueData).length === 0) {
    // gets all the needed data from supabase
    const [announcements, events, prayerTimesResult] = await Promise.all([
      getMosqueAnnouncements(lastVisitedMosqueId),
      getMosqueEvents(lastVisitedMosqueId),
      getPrayerTimes(lastVisitedMosqueId, jummahTimes),
    ]);

    // creates the mosque data object with both monthly schedule and today's times
    const mosqueData: MosqueData = {
      info: {
        ...dbMosqueData,
        last_event: dbMosqueData.last_event || new Date().toISOString(),
        last_announcement:
          dbMosqueData.last_announcement || new Date().toISOString(),
        last_prayer: dbMosqueData.last_prayer || new Date().toISOString(),
        prayer_times_settings: prayerSettings || null,
      },
      announcements: announcements || [],
      events: events || [],
      prayerTimes: prayerTimesResult.todaysPrayerTimes,
      monthlyPrayerSchedule: prayerTimesResult.monthlySchedule,
      jummahTimes: jummahTimes || null,
    };

    storage.set(
      `mosqueData-${mosqueData.info.uid}`,
      JSON.stringify(mosqueData),
    );

    // Schedule prayer notifications for first-time visit if enabled
    const prayerNotificationSettings = loadPrayerNotificationSettings();
    if (prayerNotificationSettings.enabled) {
      schedulePrayerNotifications(lastVisitedMosqueId, dbMosqueData.name).catch(
        (error) =>
          console.error("Error scheduling prayer notifications:", error),
      );
    }

    return mosqueData;
  }

  // syncs the events, announcements, and prayer times in parallel
  const [updatedEvents, updatedAnnouncements, prayerTimesResult] =
    await Promise.all([
      syncEvents(lastVisitedMosqueId, storageMosqueData, dbMosqueData),
      syncAnnouncements(lastVisitedMosqueId, storageMosqueData, dbMosqueData),
      syncPrayerTimes(lastVisitedMosqueId, storageMosqueData, dbMosqueData),
    ]);

  // updates the timestamps to reflect when we last synced with the database
  // this represents when we last checked for updates, regardless of whether new data was found
  const currentSyncTime = new Date().toISOString();
  const updatedMosqueInfo = {
    ...dbMosqueData,
    last_event: currentSyncTime,
    last_announcement: currentSyncTime,
    last_prayer: currentSyncTime,
  };

  const updatedMosqueData: ProcessedMosqueData = {
    ...storageMosqueData,
    events: updatedEvents,
    announcements: updatedAnnouncements,
    prayerTimes: prayerTimesResult.prayerTimes,
    monthlyPrayerSchedule: prayerTimesResult.monthlyPrayerSchedule,
    jummahTimes: prayerTimesResult.jummahTimes,
    info: updatedMosqueInfo,
  };

  storage.set(
    `mosqueData-${lastVisitedMosqueId}`,
    JSON.stringify(updatedMosqueData),
  );

  // Reschedule prayer notifications if prayer times were updated
  if (prayerTimesResult.prayerTimesUpdated) {
    const prayerNotificationSettings = loadPrayerNotificationSettings();
    if (prayerNotificationSettings.enabled) {
      // Schedule in background to not block the sync
      schedulePrayerNotifications(
        lastVisitedMosqueId,
        updatedMosqueInfo.name,
      ).catch((error) =>
        console.error("Error rescheduling prayer notifications:", error),
      );
    }
  }

  return updatedMosqueData;
};

/**
 * syncs the events from the db to the local storage
 * @param lastVisitedMosqueId - the id of the mosque to sync
 * @param storageMosqueData - the mosque data from the local storage
 * @param dbMosqueData - the mosque data from the db
 * @returns the updated events
 */
const syncEvents = async (
  lastVisitedMosqueId: string,
  storageMosqueData: any,
  dbMosqueData: any,
) => {
  const lastEventFetched = storageMosqueData.info.last_event;
  const lastEventPushed = dbMosqueData.last_event;

  // if the last event in the local storage is older than the last event in the db, we need to get the data from the db
  if (lastEventFetched < lastEventPushed) {
    const events = await getMosqueEvents(lastVisitedMosqueId, lastEventFetched);
    if (events && events.length > 0) {
      // creates a map of the existing events
      const existingEventsMap = new Map(
        storageMosqueData.events.map((event: any) => [event.id, event]),
      );

      // adds the new events & overwrites edited events
      events.forEach((event) => {
        existingEventsMap.set(event.id, event);
      });

      const updatedEvents = Array.from(existingEventsMap.values());
      return updatedEvents;
    }
  }

  return storageMosqueData.events;
};

/**
 * syncs the announcements from the db to the local storage
 * @param lastVisitedMosqueId - the id of the mosque to sync
 * @param storageMosqueData - the mosque data from the local storage
 * @param dbMosqueData - the mosque data from the db
 * @returns the updated announcements
 */
const syncAnnouncements = async (
  lastVisitedMosqueId: string,
  storageMosqueData: any,
  dbMosqueData: any,
) => {
  const lastAnnouncementFetched = storageMosqueData.info.last_announcement;
  const lastAnnouncementPushed = dbMosqueData.last_announcement;

  // if the last announcement in the local storage is older than the last announcement in the db, we need to get the data from the db
  if (lastAnnouncementFetched < lastAnnouncementPushed) {
    const announcements = await getMosqueAnnouncements(
      lastVisitedMosqueId,
      lastAnnouncementFetched,
    );

    // creates a map of the existing announcements
    if (announcements && announcements.length > 0) {
      const existingAnnouncementsMap = new Map(
        storageMosqueData.announcements.map((announcement: any) => [
          announcement.id,
          announcement,
        ]),
      );

      // adds the new announcements & overwrites edited announcements
      announcements.forEach((announcement) => {
        existingAnnouncementsMap.set(announcement.id, announcement);
      });

      const updatedAnnouncements = Array.from(
        existingAnnouncementsMap.values(),
      );
      return updatedAnnouncements;
    }
  }

  return storageMosqueData.announcements;
};

// Return type for syncPrayerTimes
type SyncPrayerTimesResult = {
  prayerTimes: PrayerTime;
  monthlyPrayerSchedule: DBPrayerTimes;
  jummahTimes: JummahTime | null;
  prayerTimesUpdated: boolean; // Flag to indicate if prayer times were updated from DB
};

/**
 * syncs the prayer times from the db to the local storage
 * Checks if the stored month differs from current month or if DB has newer data
 * @param lastVisitedMosqueId - the id of the mosque to sync
 * @param storageMosqueData - the mosque data from the local storage
 * @param dbMosqueData - the mosque data from the db
 * @returns the updated prayer times, monthly schedule, and jummah times
 */
const syncPrayerTimes = async (
  lastVisitedMosqueId: string,
  storageMosqueData: any,
  dbMosqueData: any,
): Promise<SyncPrayerTimesResult> => {
  const lastPrayerFetched = storageMosqueData.info.last_prayer;
  const lastPrayerPushed = dbMosqueData.last_prayer;
  const jummahTimes = dbMosqueData.jummah_times as JummahTime;

  // Check if stored monthly schedule is for current month
  const currentMonthYear = `${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getFullYear()).slice(-2)}`;
  const storedMonthYear = storageMosqueData.monthlyPrayerSchedule?.["mm-yy"];
  const monthChanged = storedMonthYear !== currentMonthYear;

  // Should sync if DB has newer data OR if month has changed
  const shouldSync = lastPrayerFetched < lastPrayerPushed || monthChanged;

  if (shouldSync) {
    const prayerTimesResult = await getPrayerTimes(
      lastVisitedMosqueId,
      jummahTimes,
    );

    return {
      prayerTimes: prayerTimesResult.todaysPrayerTimes,
      monthlyPrayerSchedule: prayerTimesResult.monthlySchedule,
      jummahTimes: jummahTimes || null,
      prayerTimesUpdated: true,
    };
  }

  // No sync needed - compute today's times from stored monthly schedule
  if (storageMosqueData.monthlyPrayerSchedule) {
    const todaysPrayerTimes = getCurrentPrayerTime(
      storageMosqueData.monthlyPrayerSchedule,
      storageMosqueData.jummahTimes || jummahTimes,
    );
    return {
      prayerTimes: todaysPrayerTimes,
      monthlyPrayerSchedule: storageMosqueData.monthlyPrayerSchedule,
      jummahTimes: storageMosqueData.jummahTimes || jummahTimes || null,
      prayerTimesUpdated: false,
    };
  }

  // No monthly schedule stored (old data) - fetch one
  const prayerTimesResult = await getPrayerTimes(
    lastVisitedMosqueId,
    jummahTimes,
  );
  return {
    prayerTimes: prayerTimesResult.todaysPrayerTimes,
    monthlyPrayerSchedule: prayerTimesResult.monthlySchedule,
    jummahTimes: jummahTimes || null,
    prayerTimesUpdated: true,
  };
};

// function to get the mosque data from supabase
const getMosqueData = async (lastVisitedMosqueId: string) => {
  try {
    const { data: mosqueInfo, error } = await supabase
      .from("mosques")
      .select()
      .eq("uid", lastVisitedMosqueId)
      .single();

    if (error) {
      console.error("Error fetching mosque data:", error);
      return null;
    }

    return mosqueInfo;
  } catch (error) {
    console.error("Error in getMosqueData:", error);
    return null;
  }
};

// function to get the mosque events from supabase
const getMosqueEvents = async (
  lastVisitedMosqueId: string,
  createdAfter?: string,
) => {
  try {
    let query = supabase
      .from("events")
      .select()
      .eq("masjid_id", lastVisitedMosqueId);

    if (createdAfter) {
      query = query.or(
        `created_at.gt.${createdAfter},updated_at.gt.${createdAfter}`,
      );
    }

    const { data: events, error } = await query;

    if (error) {
      console.error("Error fetching mosque events:", error);
      return null;
    }

    return events;
  } catch (error) {
    console.error("Error in getMosqueEvents:", error);
    return null;
  }
};

// function to get the mosque announcements from supabase
const getMosqueAnnouncements = async (
  lastVisitedMosqueId: string,
  createdAfter?: string,
) => {
  try {
    let query = supabase
      .from("announcements")
      .select()
      .eq("masjid_id", lastVisitedMosqueId);

    if (createdAfter) {
      query = query.or(
        `created_at.gt.${createdAfter},updated_at.gt.${createdAfter}`,
      );
    }

    const { data: announcements, error } = await query;

    if (error) {
      console.error("Error fetching mosque announcements:", error);
      return null;
    }

    return announcements;
  } catch (error) {
    console.error("Error in getMosqueAnnouncements:", error);
    return null;
  }
};

// Return type for getPrayerTimes - includes both raw monthly data and processed daily times
type PrayerTimesResult = {
  monthlySchedule: DBPrayerTimes;
  todaysPrayerTimes: PrayerTime;
};

/**
 * Creates default prayer times with 00:00 for all prayers
 */
const createDefaultPrayerTimes = (jummahTimes?: JummahTime): PrayerTime => ({
  fajr: { adhan: "00:00", iqama: "00:00" },
  dhuhr: { adhan: "00:00", iqama: "00:00" },
  asr: { adhan: "00:00", iqama: "00:00" },
  maghrib: { adhan: "00:00", iqama: "00:00" },
  isha: { adhan: "00:00", iqama: "00:00" },
  jummah: jummahTimes || { jummah1: { athan: "00:00", iqama: "00:00" } },
  nextPrayer: { name: "Fajr", minutesToNextPrayer: 0, percentElapsed: 0 },
  warning: "No prayer schedule available for this mosque",
});

/**
 * Creates a default empty monthly schedule
 */
const createDefaultMonthlySchedule = (): DBPrayerTimes => {
  const now = new Date();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();
  const monthYear = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getFullYear()).slice(-2)}`;

  const defaultDay = {
    fajr: { adhan: "00:00", iqama: "00:00" },
    sunrise: { adhan: "00:00", iqama: "00:00" },
    dhuhr: { adhan: "00:00", iqama: "00:00" },
    asr: { adhan: "00:00", iqama: "00:00" },
    maghrib: { adhan: "00:00", iqama: "00:00" },
    sunset: { adhan: "00:00", iqama: "00:00" },
    isha: { adhan: "00:00", iqama: "00:00" },
  };

  return {
    "mm-yy": monthYear,
    prayer_times: Array.from({ length: daysInMonth }, (_, i) => ({
      day: String(i + 1),
      times: defaultDay,
    })),
  };
};

/**
 * gets the prayer times from the db for the current month
 * Falls back to most recent schedule if current month not available
 * Returns default 00:00 times if no schedules exist
 * @param lastVisitedMosqueId - the id of the mosque
 * @param jummahTimes - the jummah times for the mosque
 * @returns both the raw monthly schedule and today's processed prayer times
 */
const getPrayerTimes = async (
  lastVisitedMosqueId: string,
  jummahTimes?: JummahTime,
): Promise<PrayerTimesResult> => {
  try {
    const monthYear = `${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getFullYear()).slice(-2)}`;

    // First, try to get the current month's schedule
    const { data: currentMonthData, error: currentMonthError } = await supabase
      .from("new_prayer_times")
      .select()
      .eq("mosque_id", lastVisitedMosqueId)
      .eq("mm-yy", monthYear)
      .single();

    if (currentMonthData && !currentMonthError) {
      // Current month schedule found
      const monthlySchedule = currentMonthData as DBPrayerTimes;
      const todaysPrayerTimes = getCurrentPrayerTime(
        monthlySchedule,
        jummahTimes as JummahTime,
      );
      console.log("todaysPrayerTimes (current month)", todaysPrayerTimes);
      return { monthlySchedule, todaysPrayerTimes };
    }

    // Current month not found - fetch all schedules and use most recent
    console.log("Current month schedule not found, fetching all schedules...");
    const { data: allSchedules, error: allSchedulesError } = await supabase
      .from("new_prayer_times")
      .select()
      .eq("mosque_id", lastVisitedMosqueId)
      .order("mm-yy", { ascending: false });

    if (allSchedulesError) {
      console.error("Error fetching all prayer schedules:", allSchedulesError);
      // Return default times with warning
      return {
        monthlySchedule: createDefaultMonthlySchedule(),
        todaysPrayerTimes: createDefaultPrayerTimes(jummahTimes),
      };
    }

    if (!allSchedules || allSchedules.length === 0) {
      // No schedules exist at all
      console.log("No prayer schedules found for this mosque");
      return {
        monthlySchedule: createDefaultMonthlySchedule(),
        todaysPrayerTimes: createDefaultPrayerTimes(jummahTimes),
      };
    }

    // Use the most recent schedule with a warning
    const mostRecentSchedule = allSchedules[0] as DBPrayerTimes;
    console.log(
      `Using most recent schedule from ${mostRecentSchedule["mm-yy"]}`,
    );

    // Get today's day of month (1-indexed, then -1 for array index)
    const today = new Date().getDate() - 1;
    // Make sure we don't go out of bounds if the old schedule has fewer days
    const dayIndex = Math.min(
      today,
      mostRecentSchedule.prayer_times.length - 1,
    );
    const dailyTimes = mostRecentSchedule.prayer_times[dayIndex].times;

    const todaysPrayerTimes: PrayerTime = {
      fajr: dailyTimes.fajr,
      dhuhr: dailyTimes.dhuhr,
      asr: dailyTimes.asr,
      maghrib: dailyTimes.maghrib,
      isha: dailyTimes.isha,
      jummah: jummahTimes || { jummah1: { athan: "00:00", iqama: "00:00" } },
      nextPrayer: { name: "", minutesToNextPrayer: 0, percentElapsed: 0 },
      warning: `Prayer times may be outdated (from ${mostRecentSchedule["mm-yy"]})`,
    };

    // Calculate next prayer
    const { getNextPrayer } = await import("./prayerTimeUtils");
    todaysPrayerTimes.nextPrayer = getNextPrayer(todaysPrayerTimes);

    console.log("todaysPrayerTimes (fallback)", todaysPrayerTimes);
    return { monthlySchedule: mostRecentSchedule, todaysPrayerTimes };
  } catch (error) {
    console.error("Error in getPrayerTimes:", error);
    // Return default times on any error
    return {
      monthlySchedule: createDefaultMonthlySchedule(),
      todaysPrayerTimes: createDefaultPrayerTimes(jummahTimes),
    };
  }
};
