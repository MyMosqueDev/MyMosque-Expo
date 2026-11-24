import {
  DBPrayerTimes,
  DailyPrayerTimes,
  JummahTime,
  NextPrayer,
  PrayerTime,
} from "./types";
import { to24HourFormat } from "./utils";

const MINUTES_PER_DAY = 24 * 60;
const FRIDAY = 5;

const DAILY_PRAYERS = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
] as const;

const JUMMAH_KEYS = ["jummah1", "jummah2", "jummah3"] as const;

export type JummahSlot = {
  key: (typeof JUMMAH_KEYS)[number];
  label: string;
  adhan: string;
  iqama: string;
};

/** False for missing times and for the "00:00" / "N/A" placeholders. */
export const isKnownTime = (time: string | null | undefined): time is string =>
  !!time && time !== "00:00" && time !== "N/A";

export const isFriday = (date: Date) => date.getDay() === FRIDAY;

/** The "MM-YY" key used by new_prayer_times. */
export const monthKey = (date: Date) =>
  `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getFullYear()).slice(-2)}`;

/** "MM-YY" as a number that sorts chronologically, which the string does not. */
export const monthOrder = (key: string) => {
  const [month, year] = key.split("-").map(Number);
  return year * 12 + month;
};

/** The Jummah prayers a mosque actually holds, in order. */
export const getJummahSlots = (
  jummah: JummahTime | null | undefined,
): JummahSlot[] => {
  const held = JUMMAH_KEYS.filter((key) => isKnownTime(jummah?.[key]?.iqama));
  return held.map((key) => ({
    key,
    label: held.length === 1 ? "Jummah" : `Jummah ${key.slice(-1)}`,
    adhan: jummah![key]!.athan || "N/A",
    iqama: jummah![key]!.iqama,
  }));
};

/** Chooses the latest month up to now, or failing that the earliest future one. */
export const pickSchedule = <T extends DBPrayerTimes>(
  schedules: T[],
  now: Date,
): T | null => {
  const current = monthOrder(monthKey(now));
  const usable = schedules
    .filter((s) => s.prayer_times?.length > 0)
    .sort((a, b) => monthOrder(a["mm-yy"]) - monthOrder(b["mm-yy"]));
  const past = usable.filter((s) => monthOrder(s["mm-yy"]) <= current);
  return past[past.length - 1] ?? usable[0] ?? null;
};

/**
 * The times for a date. Outside the scheduled month this is the nearest day we
 * have, which is the closest match and stays on the right side of a DST change.
 */
export const getTimesForDate = (
  schedule: DBPrayerTimes,
  date: Date,
): DailyPrayerTimes => {
  const days = schedule.prayer_times;
  const offset = monthOrder(monthKey(date)) - monthOrder(schedule["mm-yy"]);
  if (offset < 0) return days[0].times;
  const last = days.length - 1;
  return days[offset > 0 ? last : Math.min(date.getDate() - 1, last)].times;
};

export const getCurrentPrayerTime = (
  schedule: DBPrayerTimes,
  jummahTimes: JummahTime | null,
): PrayerTime => {
  const now = new Date();
  const { fajr, dhuhr, asr, maghrib, isha } = getTimesForDate(schedule, now);
  const times = { fajr, dhuhr, asr, maghrib, isha, jummah: jummahTimes ?? {} };

  return {
    ...times,
    nextPrayer: getNextPrayer(times),
    warning:
      monthKey(now) === schedule["mm-yy"]
        ? null
        : `Prayer times may be outdated (from ${schedule["mm-yy"]})`,
  };
};

const toMinutes = (time: string) => {
  const [hours, minutes] = to24HourFormat(time).split(":").map(Number);
  return hours * 60 + minutes;
};

/** Finds the next iqama. On Fridays, Jummah takes the place of Dhuhr. */
export const getNextPrayer = (
  prayerTimes: Omit<PrayerTime, "nextPrayer" | "warning">,
): NextPrayer => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const jummah = isFriday(now) ? getJummahSlots(prayerTimes.jummah) : [];

  const prayers = [
    ...DAILY_PRAYERS.filter(
      ({ key }) => key !== "dhuhr" || jummah.length === 0,
    ).map(({ key, label }) => ({ key, label, ...prayerTimes[key] })),
    ...jummah,
  ]
    .map((prayer) => ({ ...prayer, minutes: toMinutes(prayer.iqama) }))
    .sort((a, b) => a.minutes - b.minutes);

  // After the last iqama, the next one is tomorrow's first.
  const upcoming = prayers.findIndex((p) => p.minutes > currentTime);
  const wraps = upcoming === -1;
  const index = wraps ? 0 : upcoming;
  const next = prayers[index];
  const previous = prayers[(index - 1 + prayers.length) % prayers.length];
  const dayOffset = wraps ? MINUTES_PER_DAY : 0;

  const interval =
    (next.minutes - previous.minutes + MINUTES_PER_DAY) % MINUTES_PER_DAY ||
    MINUTES_PER_DAY;
  const elapsed =
    (currentTime - previous.minutes + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  const minutesToAdhan = isKnownTime(next.adhan)
    ? toMinutes(next.adhan) + dayOffset - currentTime
    : null;

  return {
    name: next.key,
    label: next.label,
    adhan: next.adhan,
    iqama: next.iqama,
    minutesToAdhan:
      minutesToAdhan !== null && minutesToAdhan > 0 ? minutesToAdhan : null,
    minutesToNextPrayer: next.minutes + dayOffset - currentTime,
    percentElapsed: Math.min(1, elapsed / interval),
  };
};

/**
 * Computes today's times from a stored schedule, for use between syncs.
 * Returns null when there is no usable schedule.
 */
export const getTodaysPrayerTimes = (
  schedule: DBPrayerTimes | null,
  jummahTimes: JummahTime | null,
): PrayerTime | null =>
  schedule && schedule.prayer_times?.length > 0
    ? getCurrentPrayerTime(schedule, jummahTimes)
    : null;
