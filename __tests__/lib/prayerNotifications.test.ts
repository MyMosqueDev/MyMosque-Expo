import { storage } from "@/lib/mmkv";
import {
  cancelAllPrayerNotifications,
  DEFAULT_PRAYER_NOTIFICATION_SETTINGS as DEFAULTS,
  getJummahCount,
  loadPrayerNotificationSettings,
  PrayerNotificationSettings,
  savePrayerNotificationSettings,
  schedulePrayerNotifications,
} from "@/lib/prayerNotifications";
import { Platform } from "react-native";
import { fakeNotifications as os } from "../../test/fakeNotifications";
import { jummah, month, MOSQUE_UID, setNow } from "../../test/fixtures";

const cache = (schedule: unknown, jummahTimes: unknown = jummah()) =>
  storage.set(
    `mosqueData-${MOSQUE_UID}`,
    JSON.stringify({ monthlyPrayerSchedule: schedule, jummahTimes }),
  );
const configure = (overrides: Partial<PrayerNotificationSettings> = {}) =>
  savePrayerNotificationSettings({ ...DEFAULTS, enabled: true, ...overrides });
const run = () => schedulePrayerNotifications(MOSQUE_UID, "Test Mosque");
const onDay = (day: number) =>
  os.scheduled
    .filter((n) => n.trigger.date.getDate() === day)
    .map((n) => n.identifier.split(`-${day}-`)[1]);

beforeEach(() => {
  setNow("2026-03-30T12:00:00");
  cache(month("03-26"));
  configure();
});

describe("settings", () => {
  it("default to disabled", () => {
    storage.clearAll();
    expect(loadPrayerNotificationSettings()).toEqual(DEFAULTS);
    expect(DEFAULTS.enabled).toBe(false);
  });

  it("fall back to defaults when corrupt", () => {
    storage.set("prayerNotificationSettings", "{");
    expect(loadPrayerNotificationSettings()).toEqual(DEFAULTS);
  });
});

describe("scheduling", () => {
  it("adds a 15-minute and an iqama alert for each future prayer", async () => {
    await run();
    expect(onDay(31)).toHaveLength(10);
    expect(onDay(31)).toEqual(
      expect.arrayContaining(["asr-15min", "asr-iqama"]),
    );
    const asr = os.scheduled.filter((n) => n.identifier.includes("-31-asr"));
    expect(
      asr.map(
        (n) => n.trigger.date.getHours() * 60 + n.trigger.date.getMinutes(),
      ),
    ).toEqual([975, 990]);
  });

  it("skips times already past", async () => {
    await run();
    expect(onDay(30)).not.toContain("fajr-iqama");
    expect(os.scheduled.every((n) => n.trigger.date > new Date())).toBe(true);
  });

  it("skips disabled prayers", async () => {
    configure({ prayers: { ...DEFAULTS.prayers, asr: false } });
    await run();
    expect(onDay(31).some((id) => id.startsWith("asr"))).toBe(false);
  });

  it("replaces Dhuhr with Jummah on Fridays", async () => {
    setNow("2026-03-27T05:00:00");
    await run();
    expect(onDay(27)).toEqual(
      expect.arrayContaining(["jummah1-iqama", "jummah2-15min"]),
    );
    expect(onDay(27).some((id) => id.startsWith("dhuhr"))).toBe(false);
  });

  it("keeps Friday Dhuhr when all Jummah alerts are off", async () => {
    setNow("2026-03-27T05:00:00");
    configure({ jummah: { jummah1: false, jummah2: false, jummah3: false } });
    await run();
    expect(onDay(27)).toContain("dhuhr-iqama");
  });

  it("replaces earlier alerts and leaves unrelated ones", async () => {
    os.scheduled = [
      { identifier: "prayer-notification-old" },
      { identifier: "something-else" },
    ] as never;
    await run();
    const ids = os.scheduled.map((n) => n.identifier);
    expect(ids).not.toContain("prayer-notification-old");
    expect(ids).toContain("something-else");
  });

  it("clears alerts when disabled", async () => {
    await run();
    configure({ enabled: false });
    await run();
    expect(os.scheduled).toEqual([]);
  });

  it.each([
    ["no cache", () => storage.clearAll()],
    ["no schedule", () => cache(null)],
  ])("schedules nothing with %s", async (_label, arrange) => {
    arrange();
    configure();
    await run();
    expect(os.scheduled).toEqual([]);
  });
});

describe("last month as backup", () => {
  const at = (date: string) =>
    os.scheduled
      .filter(
        (n) => n.trigger.date.toDateString() === new Date(date).toDateString(),
      )
      .map((n) => n.trigger.date.toTimeString().slice(0, 5));

  it("KI-12: continues into next month with the last known day", async () => {
    setNow("2026-03-31T23:00:00");
    const schedule = month("03-26");
    schedule.prayer_times[0].times.asr.iqama = "3:30 PM"; // before DST
    schedule.prayer_times[30].times.asr.iqama = "5:45 PM";
    cache(schedule);
    await run();
    expect(at("2026-04-01T00:00:00")).toEqual(
      expect.arrayContaining(["17:30", "17:45"]),
    );
    expect(at("2026-04-01T00:00:00")).not.toContain("15:30");
  });

  it("uses the last known day of an older schedule", async () => {
    const schedule = month("02-26", 28);
    schedule.prayer_times[27].times.asr.iqama = "4:59 PM";
    cache(schedule);
    await run();
    expect(at("2026-03-31T00:00:00")).toContain("16:59");
  });

  it("KI-10: never schedules from placeholder times", async () => {
    const none = { adhan: "00:00", iqama: "00:00" };
    const schedule = month("03-26");
    schedule.prayer_times.forEach((d) => {
      d.times = {
        fajr: none,
        sunrise: none,
        dhuhr: none,
        asr: none,
        maghrib: none,
        sunset: none,
        isha: none,
      };
    });
    cache(schedule, null);
    await run();
    expect(os.scheduled).toEqual([]);
  });
});

it("KI-12: puts the early alert for a just-past-midnight iqama on the previous day", async () => {
  setNow("2026-03-29T12:00:00");
  const schedule = month("03-26");
  schedule.prayer_times[30].times.isha.iqama = "12:10 AM";
  cache(schedule);
  await run();
  const early = os.scheduled.find((n) =>
    /03-31-isha-15min$/.test(n.identifier),
  );
  expect(early!.trigger.date).toEqual(new Date(2026, 2, 30, 23, 55));
});

it("KI-12: keeps Friday Dhuhr when the mosque has no Jummah", async () => {
  setNow("2026-03-27T05:00:00");
  cache(month("03-26"), null);
  await run();
  expect(onDay(27)).toContain("dhuhr-iqama");
});

it("KI-12: a later change wins over a run still in progress", async () => {
  const first = run();
  configure({ enabled: false });
  await Promise.all([first, run()]);
  expect(os.scheduled).toEqual([]);
});

describe("iOS limit", () => {
  const original = Platform.OS;
  afterEach(() => {
    Platform.OS = original;
  });

  it("keeps 63 alerts plus a reminder", async () => {
    Platform.OS = "ios";
    setNow("2026-03-01T00:00:00");
    await run();
    expect(os.scheduled).toHaveLength(64);
    expect(os.scheduled[63].identifier).toMatch(/reminder$/);
  });

  it("is not applied on Android", async () => {
    Platform.OS = "android";
    setNow("2026-03-01T00:00:00");
    await run();
    expect(os.scheduled.length).toBeGreaterThan(64);
  });
});

it("cancels only prayer alerts", async () => {
  await run();
  await cancelAllPrayerNotifications();
  expect(os.scheduled).toEqual([]);
});

it("counts Jummah slots", () => {
  expect(getJummahCount(null)).toBe(0);
  expect(getJummahCount(jummah())).toBe(2);
  expect(
    getJummahCount({ ...jummah(), jummah3: { athan: "", iqama: "" } }),
  ).toBe(3);
});
