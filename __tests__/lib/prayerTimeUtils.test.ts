import fc from "fast-check";
import {
  getCurrentPrayerTime,
  getNextPrayer,
  getTodaysPrayerTimes,
} from "@/lib/prayerTimeUtils";
import { PrayerTime } from "@/lib/types";
import { dailyTimes, jummah, month, setNow } from "../../test/fixtures";

const times = (overrides: Partial<PrayerTime> = {}): PrayerTime => ({
  ...dailyTimes(),
  jummah: jummah(),
  nextPrayer: {
    name: "",
    label: "",
    adhan: "",
    iqama: "",
    minutesToAdhan: null,
    minutesToNextPrayer: 0,
    percentElapsed: 0,
  },
  warning: null,
  ...overrides,
});

describe("getNextPrayer", () => {
  it.each([
    ["2026-03-11T05:00:00", "fajr", 60],
    ["2026-03-11T06:00:00", "dhuhr", 450],
    ["2026-03-11T13:00:00", "dhuhr", 30],
    ["2026-03-11T18:04:00", "maghrib", 1],
    ["2026-03-11T20:00:00", "isha", 30],
  ])("at %s the next iqama is %s", (now, name, minutes) => {
    setNow(now);
    expect(getNextPrayer(times())).toMatchObject({
      name,
      minutesToNextPrayer: minutes,
    });
  });

  it("wraps to tomorrow's fajr after isha", () => {
    setNow("2026-03-11T23:00:00");
    expect(getNextPrayer(times())).toMatchObject({
      name: "fajr",
      minutesToNextPrayer: 420,
    });
  });

  it("accepts 24-hour times", () => {
    setNow("2026-03-11T13:00:00");
    const next = getNextPrayer(
      times({ dhuhr: { adhan: "13:00", iqama: "13:30" } }),
    );
    expect(next).toMatchObject({ name: "dhuhr", minutesToNextPrayer: 30 });
  });

  it("always reports progress within bounds and a wait of at most a day", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1439 }), (minute) => {
        const h = String(Math.floor(minute / 60)).padStart(2, "0");
        const m = String(minute % 60).padStart(2, "0");
        setNow(`2026-03-11T${h}:${m}:00`);
        const next = getNextPrayer(times());
        expect(next.percentElapsed).toBeGreaterThanOrEqual(0);
        expect(next.percentElapsed).toBeLessThanOrEqual(1);
        expect(next.minutesToNextPrayer).toBeGreaterThan(0);
        expect(next.minutesToNextPrayer).toBeLessThanOrEqual(1440);
      }),
      { numRuns: 60 },
    );
  });

  describe("KI-4: Jummah on Fridays", () => {
    it.each([
      ["2026-03-13T13:00:00", "jummah1", 45],
      ["2026-03-13T14:00:00", "jummah2", 45],
      ["2026-03-13T15:00:00", "asr", 90],
    ])("at %s the next prayer is %s", (now, name, minutes) => {
      setNow(now);
      expect(getNextPrayer(times())).toMatchObject({
        name,
        minutesToNextPrayer: minutes,
      });
    });

    it("keeps dhuhr on Fridays when the mosque has no Jummah", () => {
      setNow("2026-03-13T13:00:00");
      const none = times({ jummah: null as never });
      expect(getNextPrayer(none).name).toBe("dhuhr");
      expect(getNextPrayer(times({ jummah: {} as never })).name).toBe("dhuhr");
    });

    it("keeps dhuhr on other days", () => {
      setNow("2026-03-11T13:00:00");
      expect(getNextPrayer(times()).name).toBe("dhuhr");
    });
  });
});

describe("getCurrentPrayerTime", () => {
  it("picks today's row without a warning for the current month", () => {
    setNow("2026-03-11T13:00:00");
    const schedule = month("03-26");
    schedule.prayer_times[10].times.asr.iqama = "4:45 PM";
    const today = getCurrentPrayerTime(schedule, jummah());
    expect(today.asr.iqama).toBe("4:45 PM");
    expect(today.warning).toBeNull();
    expect(today.nextPrayer.name).toBe("dhuhr");
  });

  it("warns when the schedule is for another month", () => {
    setNow("2026-03-11T13:00:00");
    const today = getCurrentPrayerTime(month("02-26", 28), jummah());
    expect(today.warning).toMatch(/outdated/i);
  });

  it("KI-5: falls back to the last row when the stored month is shorter", () => {
    setNow("2026-03-31T13:00:00");
    const schedule = month("02-26", 28);
    schedule.prayer_times[27].times.asr.iqama = "4:59 PM";
    const today = getCurrentPrayerTime(schedule, jummah());
    expect(today.asr.iqama).toBe("4:59 PM");
    expect(today.warning).toMatch(/outdated/i);
  });

  it("KI-5: tolerates a current month with missing days", () => {
    setNow("2026-03-31T13:00:00");
    const schedule = month("03-26", 28);
    schedule.prayer_times[27].times.asr.iqama = "4:59 PM";
    const today = getCurrentPrayerTime(schedule, jummah());
    expect(today.asr.iqama).toBe("4:59 PM");
    expect(today.warning).toBeNull();
  });

  it("KI-6: treats last December as the past, not the future", () => {
    setNow("2026-01-02T13:00:00");
    const schedule = month("12-25");
    schedule.prayer_times[0].times.asr.iqama = "3:30 PM";
    schedule.prayer_times[30].times.asr.iqama = "3:50 PM";
    expect(getCurrentPrayerTime(schedule, jummah()).asr.iqama).toBe("3:50 PM");
  });

  it("uses the first day of a month published early", () => {
    setNow("2026-03-31T13:00:00");
    const schedule = month("04-26", 30);
    schedule.prayer_times[0].times.asr.iqama = "5:50 PM";
    expect(getCurrentPrayerTime(schedule, jummah()).asr.iqama).toBe("5:50 PM");
  });

  it("KI-7: substitutes an empty Jummah for a mosque without one", () => {
    setNow("2026-03-11T13:00:00");
    expect(getCurrentPrayerTime(month("03-26"), null as never).jummah).toEqual(
      {},
    );
  });
});

describe("getTodaysPrayerTimes", () => {
  it("returns null without a schedule", () => {
    expect(getTodaysPrayerTimes(null, jummah())).toBeNull();
  });

  it("computes today's times", () => {
    setNow("2026-03-11T13:00:00");
    expect(
      getTodaysPrayerTimes(month("03-26"), jummah())?.nextPrayer.name,
    ).toBe("dhuhr");
  });

  it("KI-7: still refreshes when the mosque has no Jummah", () => {
    setNow("2026-03-11T13:00:00");
    expect(getTodaysPrayerTimes(month("03-26"), null)).not.toBeNull();
  });
});
