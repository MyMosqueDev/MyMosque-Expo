import { storage } from "@/lib/mmkv";
import {
  DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
  savePrayerNotificationSettings,
} from "@/lib/prayerNotifications";
import { syncStorage } from "@/lib/syncStorage";
import { fakeNotifications } from "../../test/fakeNotifications";
import { fakeSupabase as db } from "../../test/fakeSupabase";
import {
  announcementRow,
  eventRow,
  MOSQUE_UID,
  monthRow,
  mosqueRow,
  setNow,
} from "../../test/fixtures";

const ids = (rows: { id: string }[]) => rows.map((r) => r.id).sort();
const cached = () => JSON.parse(storage.getString(`mosqueData-${MOSQUE_UID}`)!);

beforeEach(() => {
  setNow("2026-03-11T12:00:00");
  db.tables = {
    mosques: [mosqueRow()],
    announcements: [announcementRow()],
    events: [eventRow()],
    new_prayer_times: [monthRow("03-26")],
  };
});

const publish = (
  table: "announcements" | "events",
  marker: "last_announcement" | "last_event",
  row: Record<string, unknown>,
  at: string,
) => {
  db.tables[table] = [
    ...db.tables[table].filter((r) => r.id !== row.id),
    { ...row },
  ];
  db.tables.mosques[0][marker] = at;
};

describe("first visit", () => {
  it("downloads and caches everything", async () => {
    const data = await syncStorage(MOSQUE_UID);
    expect(ids(data.announcements)).toEqual(["a1"]);
    expect(ids(data.events)).toEqual(["e1"]);
    expect(data.monthlyPrayerSchedule?.["mm-yy"]).toBe("03-26");
    expect(cached().info.uid).toBe(MOSQUE_UID);
  });

  it("rejects an unknown mosque", async () => {
    await expect(syncStorage("nope")).rejects.toThrow(/not found/);
  });

  it("rejects when offline with nothing cached", async () => {
    db.goOffline();
    await expect(syncStorage(MOSQUE_UID)).rejects.toThrow();
  });

  it("KI-3: retries a stream that failed on the first visit", async () => {
    db.failing.add("announcements");
    expect((await syncStorage(MOSQUE_UID)).announcements).toEqual([]);
    db.goOnline();
    expect(ids((await syncStorage(MOSQUE_UID)).announcements)).toEqual(["a1"]);
  });
});

describe.each([
  ["announcements", "last_announcement", announcementRow],
  ["events", "last_event", eventRow],
] as const)("delta sync of %s", (table, marker, makeRow) => {
  const at = "2026-03-11T16:00:00+00:00";
  beforeEach(async () => {
    await syncStorage(MOSQUE_UID);
  });

  it("does not refetch when nothing was published", async () => {
    const before = db.countQueries(table);
    await syncStorage(MOSQUE_UID);
    expect(db.countQueries(table)).toBe(before);
  });

  it("adds newly published rows", async () => {
    publish(table, marker, makeRow({ id: "new", created_at: at }), at);
    expect(ids((await syncStorage(MOSQUE_UID))[table])).toContain("new");
  });

  it("replaces edited rows", async () => {
    const id = db.tables[table][0].id;
    publish(
      table,
      marker,
      makeRow({ id, title: "Edited", updated_at: at }),
      at,
    );
    const rows = (await syncStorage(MOSQUE_UID))[table];
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe("Edited");
  });

  it("KI-3: retries after a failed fetch instead of losing the row", async () => {
    publish(table, marker, makeRow({ id: "new", created_at: at }), at);
    db.failing.add(table);
    await syncStorage(MOSQUE_UID);
    db.goOnline();
    expect(ids((await syncStorage(MOSQUE_UID))[table])).toContain("new");
  });

  it("KI-3: is immune to a fast device clock", async () => {
    setNow("2026-03-11T20:00:00");
    await syncStorage(MOSQUE_UID);
    setNow("2026-03-11T12:00:00");
    publish(table, marker, makeRow({ id: "new", created_at: at }), at);
    expect(ids((await syncStorage(MOSQUE_UID))[table])).toContain("new");
  });

  it("KI-3: recovers rows an older app version already lost", async () => {
    publish(table, marker, makeRow({ id: "lost", created_at: at }), at);
    // What the old code left behind: device-time cursor, row never stored.
    const stale = cached();
    const deviceNow = "2026-03-11T18:00:00.000Z";
    stale.info = {
      ...stale.info,
      last_event: deviceNow,
      last_announcement: deviceNow,
      last_prayer: deviceNow,
    };
    delete stale.cacheVersion;
    delete stale.cursors;
    storage.set(`mosqueData-${MOSQUE_UID}`, JSON.stringify(stale));
    expect(ids((await syncStorage(MOSQUE_UID))[table])).toContain("lost");
  });
});

describe("KI-2: offline with a warm cache", () => {
  beforeEach(async () => {
    await syncStorage(MOSQUE_UID);
    db.goOffline();
  });

  it("returns cached content", async () => {
    const data = await syncStorage(MOSQUE_UID);
    expect(ids(data.announcements)).toEqual(["a1"]);
    expect(data.info.name).toBe("Test Mosque");
  });

  it("recomputes today's prayer times from the cached month", async () => {
    setNow("2026-03-12T20:00:00");
    expect((await syncStorage(MOSQUE_UID)).prayerTimes.nextPrayer.name).toBe(
      "isha",
    );
  });

  it("catches up once back online", async () => {
    await syncStorage(MOSQUE_UID);
    db.goOnline();
    const at = "2026-03-11T18:00:00+00:00";
    publish(
      "announcements",
      "last_announcement",
      announcementRow({ id: "new", created_at: at }),
      at,
    );
    const data = await syncStorage(MOSQUE_UID);
    expect(ids(data.announcements)).toContain("new");
  });
});

describe("prayer schedule", () => {
  it("refetches when the month rolls over", async () => {
    await syncStorage(MOSQUE_UID);
    db.tables.new_prayer_times.push(monthRow("04-26", 30));
    setNow("2026-04-01T12:00:00");
    const data = await syncStorage(MOSQUE_UID);
    expect(data.monthlyPrayerSchedule?.["mm-yy"]).toBe("04-26");
    expect(data.prayerTimes.warning).toBeNull();
  });

  it("uses an older month with a warning when the current one is missing", async () => {
    db.tables.new_prayer_times = [monthRow("02-26", 28)];
    const data = await syncStorage(MOSQUE_UID);
    expect(data.prayerTimes.warning).toMatch(/outdated/i);
  });

  it("KI-6: picks the latest month across a year boundary", async () => {
    db.tables.new_prayer_times = ["11-25", "12-25", "01-26", "02-26"].map((m) =>
      monthRow(m, 28),
    );
    const data = await syncStorage(MOSQUE_UID);
    expect(data.monthlyPrayerSchedule?.["mm-yy"]).toBe("02-26");
  });

  it("KI-6: picks the later month when only last year's remain", async () => {
    db.tables.new_prayer_times = [monthRow("12-25"), monthRow("11-25", 30)];
    const data = await syncStorage(MOSQUE_UID);
    expect(data.monthlyPrayerSchedule?.["mm-yy"]).toBe("12-25");
  });

  it("shows a placeholder with a warning when no schedule exists", async () => {
    db.tables.new_prayer_times = [];
    const data = await syncStorage(MOSQUE_UID);
    expect(data.prayerTimes.fajr.iqama).toBe("00:00");
    expect(data.prayerTimes.warning).toMatch(/no prayer schedule/i);
  });

  it("KI-2: keeps the cached month when a schedule refetch fails", async () => {
    await syncStorage(MOSQUE_UID);
    db.tables.mosques[0].last_prayer = "2026-03-11T16:00:00+00:00";
    db.failing.add("new_prayer_times");
    const data = await syncStorage(MOSQUE_UID);
    expect(data.prayerTimes.fajr.iqama).toBe("6:00 AM");
  });

  it("KI-7: tolerates a mosque without Jummah", async () => {
    db.tables.mosques = [mosqueRow({ jummah_times: null })];
    const data = await syncStorage(MOSQUE_UID);
    expect(data.prayerTimes.jummah).toEqual({});
  });
});

describe("last month as backup", () => {
  beforeEach(async () => {
    const march = monthRow("03-26");
    march.prayer_times[30].times.asr.iqama = "5:45 PM";
    db.tables.new_prayer_times = [march];
    await syncStorage(MOSQUE_UID);
    setNow("2026-04-01T09:00:00");
  });

  it("uses the last known day while the new month cannot be downloaded", async () => {
    db.failing.add("new_prayer_times");
    const data = await syncStorage(MOSQUE_UID);
    expect(data.prayerTimes.asr.iqama).toBe("5:45 PM");
    expect(data.prayerTimes.warning).toMatch(/outdated/i);
    expect(data.syncStatus).toBe("partial");
  });

  it("uses it while the new month is not published yet", async () => {
    const data = await syncStorage(MOSQUE_UID);
    expect(data.prayerTimes.asr.iqama).toBe("5:45 PM");
    expect(data.prayerTimes.warning).toMatch(/outdated/i);
  });

  it("uses it even if the server no longer lists any schedule", async () => {
    db.tables.new_prayer_times = [];
    const data = await syncStorage(MOSQUE_UID);
    expect(data.prayerTimes.asr.iqama).toBe("5:45 PM");
  });

  it("switches as soon as the new month appears", async () => {
    await syncStorage(MOSQUE_UID);
    db.tables.new_prayer_times.push(monthRow("04-26", 30));
    const data = await syncStorage(MOSQUE_UID);
    expect(data.monthlyPrayerSchedule?.["mm-yy"]).toBe("04-26");
    expect(data.prayerTimes.warning).toBeNull();
  });
});

it("prefers the latest past month over one published early", async () => {
  db.tables.new_prayer_times = [monthRow("02-26", 28), monthRow("04-26", 30)];
  const data = await syncStorage(MOSQUE_UID);
  expect(data.monthlyPrayerSchedule?.["mm-yy"]).toBe("02-26");
});

it("recovers from a corrupt cache", async () => {
  storage.set(`mosqueData-${MOSQUE_UID}`, "{");
  expect(ids((await syncStorage(MOSQUE_UID)).events)).toEqual(["e1"]);
});

it("discards placeholder months cached by older versions", async () => {
  const none = { adhan: "00:00", iqama: "00:00" };
  const old = monthRow("03-26");
  old.prayer_times.forEach((d) => {
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
  storage.set(
    `mosqueData-${MOSQUE_UID}`,
    JSON.stringify({
      info: mosqueRow(),
      announcements: [],
      events: [],
      monthlyPrayerSchedule: old,
      jummahTimes: null,
    }),
  );
  db.failing.add("new_prayer_times");
  const data = await syncStorage(MOSQUE_UID);
  expect(data.monthlyPrayerSchedule).toBeNull();
  expect(data.prayerTimes.warning).toMatch(/no prayer schedule/i);
});

it("reports how complete the sync was", async () => {
  expect((await syncStorage(MOSQUE_UID)).syncStatus).toBe("fresh");
  db.tables.mosques[0].last_event = "2026-03-11T16:00:00+00:00";
  db.failing.add("events");
  expect((await syncStorage(MOSQUE_UID)).syncStatus).toBe("partial");
  db.goOffline();
  expect((await syncStorage(MOSQUE_UID)).syncStatus).toBe("offline");
});

it("tolerates an admin clock that runs ahead of the database", async () => {
  // Marker stamped 10 minutes in the future, then a row inside that gap.
  publish(
    "announcements",
    "last_announcement",
    announcementRow({ id: "n1", created_at: "2026-03-11T16:00:00+00:00" }),
    "2026-03-11T16:10:00+00:00",
  );
  await syncStorage(MOSQUE_UID);
  publish(
    "announcements",
    "last_announcement",
    announcementRow({ id: "n2", created_at: "2026-03-11T16:05:00+00:00" }),
    "2026-03-11T16:15:00+00:00",
  );
  expect(ids((await syncStorage(MOSQUE_UID)).announcements)).toContain("n2");
});

describe("reminders", () => {
  const flush = () => new Promise((r) => setTimeout(r, 20));
  beforeEach(() =>
    savePrayerNotificationSettings({
      ...DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
      enabled: true,
    }),
  );

  it("schedules on the first visit and after a schedule change", async () => {
    await syncStorage(MOSQUE_UID);
    await flush();
    expect(fakeNotifications.scheduled.length).toBeGreaterThan(0);

    fakeNotifications.scheduled = [];
    const edited = monthRow("03-26");
    edited.prayer_times[11].times.asr.iqama = "5:15 PM";
    db.tables.new_prayer_times = [edited];
    db.tables.mosques[0].last_prayer = "2026-03-11T16:00:00+00:00";
    await syncStorage(MOSQUE_UID);
    await flush();
    expect(fakeNotifications.scheduled.length).toBeGreaterThan(0);
  });

  it("reschedules when only the Jummah times change", async () => {
    await syncStorage(MOSQUE_UID);
    await flush();
    fakeNotifications.scheduled = [];
    db.tables.mosques[0].jummah_times = {
      jummah1: { athan: "2:00 PM", iqama: "2:15 PM" },
    };
    await syncStorage(MOSQUE_UID);
    await flush();
    expect(fakeNotifications.scheduled.length).toBeGreaterThan(0);
  });

  it("leaves reminders alone when nothing changed", async () => {
    await syncStorage(MOSQUE_UID);
    await flush();
    fakeNotifications.scheduled = [];
    await syncStorage(MOSQUE_UID);
    await flush();
    expect(fakeNotifications.scheduled).toEqual([]);
  });
});
