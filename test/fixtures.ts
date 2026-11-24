import { DailyPrayerTimes, DBPrayerTimes, JummahTime } from "@/lib/types";

export const MOSQUE_UID = "mosque-1";

export const dailyTimes = (): DailyPrayerTimes => ({
  fajr: { adhan: "5:30 AM", iqama: "6:00 AM" },
  sunrise: { adhan: "7:00 AM", iqama: "7:00 AM" },
  dhuhr: { adhan: "1:00 PM", iqama: "1:30 PM" },
  asr: { adhan: "4:00 PM", iqama: "4:30 PM" },
  maghrib: { adhan: "6:00 PM", iqama: "6:05 PM" },
  sunset: { adhan: "6:00 PM", iqama: "6:00 PM" },
  isha: { adhan: "8:00 PM", iqama: "8:30 PM" },
});

export const jummah = (): JummahTime => ({
  jummah1: { athan: "1:15 PM", iqama: "1:45 PM" },
  jummah2: { athan: "2:30 PM", iqama: "2:45 PM" },
});

export const month = (mmyy: string, days = 31): DBPrayerTimes => ({
  "mm-yy": mmyy,
  prayer_times: Array.from({ length: days }, (_, i) => ({
    day: String(i + 1),
    times: dailyTimes(),
  })),
});

export const monthRow = (mmyy: string, days = 31) => ({
  mosque_id: MOSQUE_UID,
  ...month(mmyy, days),
});

export const mosqueRow = (overrides: Record<string, unknown> = {}) => ({
  id: "1",
  uid: MOSQUE_UID,
  name: "Test Mosque",
  address: "1 Main St, Austin, TX",
  images: [],
  coordinates: { latitude: 30.28, longitude: -97.74 },
  hours: {
    monday: "Mon hours",
    tuesday: "Tue hours",
    wednesday: "Wed hours",
    thursday: "Thu hours",
    friday: "Fri hours",
    saturday: "Sat hours",
    sunday: "Sun hours",
  },
  contact_info: [],
  jummah_times: jummah(),
  prayer_settings: null,
  last_event: "2026-03-01T00:00:00+00:00",
  last_announcement: "2026-03-01T00:00:00+00:00",
  last_prayer: "2026-03-01T00:00:00+00:00",
  ...overrides,
});

export const announcementRow = (overrides: Record<string, unknown> = {}) => ({
  id: "a1",
  masjid_id: MOSQUE_UID,
  title: "Parking update",
  description: "Use the north lot",
  severity: "low",
  status: "active",
  created_at: "2026-03-01T00:00:00+00:00",
  updated_at: null,
  ...overrides,
});

export const eventRow = (overrides: Record<string, unknown> = {}) => ({
  id: "e1",
  masjid_id: MOSQUE_UID,
  title: "Halaqa",
  description: "Weekly class",
  host: "Test Mosque",
  location: "Main hall",
  image: "",
  date: "2026-03-20T19:00:00-05:00",
  status: "active",
  created_at: "2026-03-01T00:00:00+00:00",
  updated_at: null,
  ...overrides,
});

/** Freezes Date only; promises and timers keep running. */
export const setNow = (local: string) =>
  jest.useFakeTimers({
    now: new Date(local),
    doNotFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "setImmediate",
      "clearImmediate",
      "nextTick",
      "queueMicrotask",
      "performance",
      "requestAnimationFrame",
      "cancelAnimationFrame",
    ],
  });
