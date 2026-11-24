import { saveUserData } from "@/lib/userData";
import fc from "fast-check";
import { format } from "@/lib/dateUtils";
import { getPushToken } from "@/lib/getPushToken";
import { fetchMosqueInfo, loadFonts, to24HourFormat } from "@/lib/utils";
import * as Font from "expo-font";
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

describe("to24HourFormat", () => {
  it.each([
    ["12:00 AM", "00:00"],
    ["12:30 PM", "12:30"],
    ["1:05 pm", "13:05"],
    ["13:30", "13:30"],
    ["N/A", "00:00"],
    ["", "00:00"],
  ])("%s -> %s", (input, expected) => {
    expect(to24HourFormat(input)).toBe(expected);
  });

  it("round-trips every minute of the day", () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1439 }), (minute) => {
        const h = Math.floor(minute / 60);
        const mm = String(minute % 60).padStart(2, "0");
        const twelve = `${h % 12 || 12}:${mm} ${h < 12 ? "AM" : "PM"}`;
        expect(to24HourFormat(twelve)).toBe(
          `${String(h).padStart(2, "0")}:${mm}`,
        );
      }),
    );
  });
});

describe("format", () => {
  const date = new Date(2026, 2, 22, 14, 5);
  it.each([
    ["EEEE, MMMM d", "Sunday, March 22"],
    ["EEEE, MMMM do", "Sunday, March 22nd"],
    ["h:mm a", "2:05 PM"],
    ["EEEE", "Sunday"],
    ["MMM d", "Mar 22"],
  ])("%s", (pattern, expected) => {
    expect(format(date, pattern)).toBe(expected);
  });

  it("rejects unknown patterns", () => {
    expect(() => format(date, "yyyy")).toThrow(/Unsupported/);
  });
});

describe("fetchMosqueInfo", () => {
  it("returns null before a mosque is chosen", async () => {
    expect(await fetchMosqueInfo()).toBeNull();
  });

  it("hides deleted and draft rows and sorts the rest", async () => {
    setNow("2026-03-11T12:00:00");
    saveUserData({ favoriteMosques: [], lastVisitedMosque: MOSQUE_UID });
    db.tables = {
      mosques: [mosqueRow()],
      new_prayer_times: [monthRow("03-26")],
      announcements: [
        announcementRow({ id: "old", created_at: "2026-03-01T00:00:00Z" }),
        announcementRow({ id: "new", created_at: "2026-03-05T00:00:00Z" }),
        announcementRow({ id: "gone", status: "deleted" }),
      ],
      events: [
        eventRow({ id: "later", date: "2026-03-25T00:00:00Z" }),
        eventRow({ id: "sooner", date: "2026-03-15T00:00:00Z" }),
        eventRow({ id: "draft", status: "draft" }),
      ],
    };
    const data = await fetchMosqueInfo();
    expect(data!.announcements.map((a) => a.id)).toEqual(["new", "old"]);
    expect(data!.events.map((e) => e.id)).toEqual(["sooner", "later"]);
  });
});

describe("getPushToken", () => {
  it("returns the Expo token", async () => {
    expect(await getPushToken()).toBe("ExponentPushToken[test]");
  });

  it("returns undefined when unavailable", async () => {
    fakeNotifications.pushToken = new Error("no APNs");
    expect(await getPushToken()).toBeUndefined();
  });
});

describe("loadFonts", () => {
  it("loads the app fonts", async () => {
    await expect(loadFonts()).resolves.toBeUndefined();
  });

  it("explains a failure", async () => {
    jest.mocked(Font.loadAsync).mockRejectedValueOnce(new Error("missing"));
    await expect(loadFonts()).rejects.toThrow("Failed to load fonts: missing");
  });
});
