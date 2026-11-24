// Keeps a mosque's data on the device in step with the database.
//
// Each stream (announcements, events, prayer times) has a marker on the mosque
// row that the backend changes on every publish. We save the last marker whose
// data we actually received, and refetch while it differs from the database's.
// A failed request leaves its cursor alone, so it is retried on the next sync.
// Cursors only ever hold server values; the device clock is not trusted.

import { storage } from "./mmkv";
import {
  loadPrayerNotificationSettings,
  schedulePrayerNotifications,
} from "./prayerNotifications";
import {
  getTodaysPrayerTimes,
  isKnownTime,
  monthKey,
  pickSchedule,
} from "./prayerTimeUtils";
import { supabase } from "./supabase";
import {
  Announcement,
  DBPrayerTimes,
  Event,
  JummahTime,
  PrayerTime,
  ProcessedMosqueData,
} from "./types";

// Version 1 advanced its cursors even when requests failed, so its caches can be
// missing rows. Older versions are refetched in full.
const CACHE_VERSION = 2;

// Deltas reach back past the cursor because markers and row timestamps may come
// from different clocks. Re-reading rows is harmless; they are merged by id.
const DELTA_OVERLAP_MS = 24 * 60 * 60 * 1000;

type Marker = string | null;
type Stream = "announcements" | "events" | "prayer";

type CachedMosqueData = Omit<ProcessedMosqueData, "syncStatus"> & {
  cacheVersion?: number;
  /** A missing stream has never been fetched successfully. */
  cursors?: Partial<Record<Stream, Marker>>;
  syncedAt?: string;
};

type Fetched<T> = { ok: true; data: T } | { ok: false };

/**
 * Syncs a mosque and returns its data. Falls back to saved data when the
 * database cannot be reached.
 * @throws when the mosque does not exist, or is unreachable with nothing saved
 */
export const syncStorage = async (
  mosqueId: string,
): Promise<ProcessedMosqueData> => {
  const cache = readCache(mosqueId);
  const mosque = await fetchMosque(mosqueId);

  if (!mosque.ok) {
    if (!cache) {
      throw new Error("Could not load this mosque. Check your connection.");
    }
    return toResult(cache, "offline");
  }
  if (!mosque.data) {
    throw new Error(`Mosque with ID ${mosqueId} not found`);
  }

  const info = mosque.data;
  const cursors = cache?.cacheVersion === CACHE_VERSION ? cache.cursors : {};
  const jummahTimes: JummahTime | null = info.jummah_times ?? null;

  const [announcements, events, prayer] = await Promise.all([
    syncRows<Announcement>("announcements", mosqueId, {
      saved: cache?.announcements,
      cursor: cursors?.announcements,
      marker: info.last_announcement ?? null,
    }),
    syncRows<Event>("events", mosqueId, {
      saved: cache?.events,
      cursor: cursors?.events,
      marker: info.last_event ?? null,
    }),
    syncSchedule(mosqueId, {
      saved: cache?.monthlyPrayerSchedule ?? null,
      cursor: cursors?.prayer,
      marker: info.last_prayer ?? null,
    }),
  ]);

  const updated: CachedMosqueData = {
    info,
    announcements: announcements.rows,
    events: events.rows,
    prayerTimes: todaysTimes(prayer.schedule, jummahTimes),
    monthlyPrayerSchedule: prayer.schedule,
    jummahTimes,
    cacheVersion: CACHE_VERSION,
    cursors: {
      announcements: announcements.cursor,
      events: events.cursor,
      prayer: prayer.cursor,
    },
    syncedAt: new Date().toISOString(),
  };
  storage.set(cacheKey(mosqueId), JSON.stringify(updated));

  const reminderTimesChanged =
    JSON.stringify([prayer.schedule, jummahTimes]) !==
    JSON.stringify([
      cache?.monthlyPrayerSchedule ?? null,
      cache?.jummahTimes ?? null,
    ]);
  if (reminderTimesChanged && loadPrayerNotificationSettings().enabled) {
    // Not awaited, so reminders never delay showing data.
    schedulePrayerNotifications(mosqueId, info.name).catch((error) =>
      console.error("Error scheduling prayer notifications:", error),
    );
  }

  const complete = announcements.ok && events.ok && prayer.ok;
  return toResult(updated, complete ? "fresh" : "partial");
};

const cacheKey = (mosqueId: string) => `mosqueData-${mosqueId}`;

const readCache = (mosqueId: string): CachedMosqueData | null => {
  const saved = storage.getString(cacheKey(mosqueId));
  if (!saved) return null;
  try {
    const cache: CachedMosqueData = JSON.parse(saved);
    if (!cache?.info) return null;
    return {
      ...cache,
      announcements: cache.announcements ?? [],
      events: cache.events ?? [],
      monthlyPrayerSchedule: isRealSchedule(cache.monthlyPrayerSchedule)
        ? cache.monthlyPrayerSchedule
        : null,
    };
  } catch (error) {
    console.error("Ignoring unreadable mosque cache:", error);
    return null;
  }
};

/** Earlier versions cached a month of 00:00 when they had no schedule. */
const isRealSchedule = (schedule: DBPrayerTimes | null | undefined) =>
  !!schedule?.prayer_times?.some(({ times }) =>
    isKnownTime(times?.fajr?.iqama),
  );

const toResult = (
  cache: CachedMosqueData,
  syncStatus: ProcessedMosqueData["syncStatus"],
): ProcessedMosqueData => ({
  info: cache.info,
  announcements: cache.announcements,
  events: cache.events,
  prayerTimes: todaysTimes(cache.monthlyPrayerSchedule, cache.jummahTimes),
  monthlyPrayerSchedule: cache.monthlyPrayerSchedule,
  jummahTimes: cache.jummahTimes ?? null,
  syncStatus,
});

const todaysTimes = (
  schedule: DBPrayerTimes | null,
  jummahTimes: JummahTime | null,
): PrayerTime =>
  getTodaysPrayerTimes(schedule, jummahTimes) ?? placeholderTimes(jummahTimes);

const placeholderTimes = (jummahTimes: JummahTime | null): PrayerTime => ({
  fajr: { adhan: "00:00", iqama: "00:00" },
  dhuhr: { adhan: "00:00", iqama: "00:00" },
  asr: { adhan: "00:00", iqama: "00:00" },
  maghrib: { adhan: "00:00", iqama: "00:00" },
  isha: { adhan: "00:00", iqama: "00:00" },
  jummah: jummahTimes ?? {},
  nextPrayer: {
    name: "fajr",
    label: "Fajr",
    adhan: "00:00",
    iqama: "00:00",
    minutesToAdhan: null,
    minutesToNextPrayer: 0,
    percentElapsed: 0,
  },
  warning: "No prayer schedule available for this mosque",
});

type SyncState<T> = { saved: T; cursor: Marker | undefined; marker: Marker };

const syncRows = async <T extends { id: string }>(
  table: "announcements" | "events",
  mosqueId: string,
  { saved = [], cursor, marker }: SyncState<T[] | undefined>,
): Promise<{ rows: T[]; cursor: Marker | undefined; ok: boolean }> => {
  if (cursor !== undefined && cursor === marker) {
    return { rows: saved, cursor, ok: true };
  }

  const fetched = await fetchRows<T>(table, mosqueId, cursor ?? null);
  if (!fetched.ok) return { rows: saved, cursor, ok: false };

  // Without a cursor this was a full fetch, which replaces what we had.
  const merged = new Map((cursor ? saved : []).map((row) => [row.id, row]));
  fetched.data.forEach((row) => merged.set(row.id, row));
  return { rows: [...merged.values()], cursor: marker, ok: true };
};

const syncSchedule = async (
  mosqueId: string,
  { saved, cursor, marker }: SyncState<DBPrayerTimes | null>,
): Promise<{
  schedule: DBPrayerTimes | null;
  cursor: Marker | undefined;
  ok: boolean;
}> => {
  const now = new Date();
  const isCurrent = saved?.["mm-yy"] === monthKey(now);
  if (isCurrent && cursor !== undefined && cursor === marker) {
    return { schedule: saved, cursor, ok: true };
  }

  const fetched = await fetchSchedule(mosqueId, now);
  if (!fetched.ok) return { schedule: saved, cursor, ok: false };
  // With nothing published, the last schedule we had is the best backup.
  return { schedule: fetched.data ?? saved, cursor: marker, ok: true };
};

const attempt = async <T>(
  label: string,
  request: () => PromiseLike<{ data: T; error: unknown }>,
): Promise<Fetched<T>> => {
  try {
    const { data, error } = await request();
    if (!error) return { ok: true, data };
    console.error(`Error fetching ${label}:`, error);
  } catch (error) {
    console.error(`Error fetching ${label}:`, error);
  }
  return { ok: false };
};

/** Resolves to null data when the mosque does not exist. */
const fetchMosque = async (mosqueId: string): Promise<Fetched<any | null>> => {
  const result = await attempt<any[] | null>("mosque", () =>
    supabase.from("mosques").select().eq("uid", mosqueId),
  );
  return result.ok ? { ok: true, data: result.data?.[0] ?? null } : result;
};

const fetchRows = async <T>(
  table: "announcements" | "events",
  mosqueId: string,
  cursor: Marker,
): Promise<Fetched<T[]>> => {
  const result = await attempt<T[] | null>(table, () => {
    const query = supabase.from(table).select().eq("masjid_id", mosqueId);
    if (!cursor) return query;
    const since = new Date(
      new Date(cursor).getTime() - DELTA_OVERLAP_MS,
    ).toISOString();
    return query.or(`created_at.gt.${since},updated_at.gt.${since}`);
  });
  return result.ok ? { ok: true, data: result.data ?? [] } : result;
};

/** Resolves to null data when the mosque has published no usable schedule. */
const fetchSchedule = async (
  mosqueId: string,
  now: Date,
): Promise<Fetched<DBPrayerTimes | null>> => {
  const current = await attempt<DBPrayerTimes[] | null>("prayer schedule", () =>
    supabase
      .from("new_prayer_times")
      .select()
      .eq("mosque_id", mosqueId)
      .eq("mm-yy", monthKey(now)),
  );
  if (!current.ok) return current;
  const exact = pickSchedule(current.data ?? [], now);
  if (exact) return { ok: true, data: exact };

  const all = await attempt<DBPrayerTimes[] | null>("prayer schedules", () =>
    supabase.from("new_prayer_times").select().eq("mosque_id", mosqueId),
  );
  return all.ok ? { ok: true, data: pickSchedule(all.data ?? [], now) } : all;
};
