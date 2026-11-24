import { loadAppSettings, saveAppSettings } from "@/lib/appSettings";
import { storage } from "@/lib/mmkv";
import {
  DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
  savePrayerNotificationSettings,
} from "@/lib/prayerNotifications";
import { syncPushRegistration } from "@/lib/pushRegistration";
import { saveUserData } from "@/lib/userData";
import { fakeNotifications as os } from "../../test/fakeNotifications";
import { MOSQUE_UID } from "../../test/fixtures";

const choose = (uid: string | null) =>
  saveUserData({ favoriteMosques: [], lastVisitedMosque: uid });
let post: jest.Mock;
const body = (call = 0) => JSON.parse(post.mock.calls[call][1].body);

beforeEach(() => {
  post = jest.fn(async () => ({ ok: true, status: 200 }));
  global.fetch = post as never;
  choose(MOSQUE_UID);
});

it("posts the token, mosque and preferences over https", async () => {
  expect(await syncPushRegistration()).toBe("sent");
  expect(post.mock.calls[0][0]).toBe("https://www.mymosque.app/api/pushToken");
  expect(post.mock.calls[0][1].method).toBe("POST");
  expect(body()).toEqual({
    pushToken: "ExponentPushToken[test]",
    mosqueId: MOSQUE_UID,
    settings: {
      events: { enabled: true },
      announcements: { enabled: true },
      development: { enabled: false },
      prayer_times: { enabled: false },
    },
  });
});

it("sends nothing when nothing changed", async () => {
  await syncPushRegistration();
  expect(await syncPushRegistration()).toBe("unchanged");
  expect(post).toHaveBeenCalledTimes(1);
});

it.each([
  ["mosque", () => choose("mosque-2")],
  ["token", () => void (os.pushToken = "ExponentPushToken[new]")],
  [
    "event preference",
    async () =>
      saveAppSettings({
        ...loadAppSettings(),
        events: { enabled: false },
      }),
  ],
  [
    "prayer preference",
    () =>
      savePrayerNotificationSettings({
        ...DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
        enabled: true,
      }),
  ],
])("sends again when the %s changes", async (_label, change) => {
  await syncPushRegistration();
  await change();
  expect(await syncPushRegistration()).toBe("sent");
  expect(post).toHaveBeenCalledTimes(2);
});

it.each([
  ["the network fails", () => post.mockRejectedValueOnce(new Error("offline"))],
  [
    "the server refuses",
    () => post.mockResolvedValueOnce({ ok: false, status: 500 }),
  ],
])("retries later when %s", async (_label, arrange) => {
  arrange();
  expect(await syncPushRegistration()).toBe("failed");
  expect(await syncPushRegistration()).toBe("sent");
});

it("does not hang on an unresponsive server", async () => {
  jest.useFakeTimers();
  post.mockImplementationOnce(
    (_url, { signal }) =>
      new Promise((_resolve, reject) =>
        signal.addEventListener("abort", () => reject(new Error("aborted"))),
      ),
  );
  const result = syncPushRegistration();
  await jest.advanceTimersByTimeAsync(15_000);
  expect(await result).toBe("failed");
});

it.each([
  ["permission is missing", () => void (os.permission = "denied")],
  ["there is no token", () => void (os.pushToken = new Error("simulator"))],
  ["no mosque is chosen", () => choose(null)],
])("skips when %s", async (_label, arrange) => {
  await arrange();
  expect(await syncPushRegistration()).toBe("skipped");
  expect(post).not.toHaveBeenCalled();
});

it("coalesces concurrent calls", async () => {
  await Promise.all([syncPushRegistration(), syncPushRegistration()]);
  expect(post).toHaveBeenCalledTimes(1);
});

it("recovers from a corrupt record", async () => {
  storage.set("pushRegistration", "{");
  expect(await syncPushRegistration()).toBe("sent");
});

describe("app settings", () => {
  it("default to on", async () => {
    expect(loadAppSettings().events.enabled).toBe(true);
  });

  it("fall back to defaults when corrupt", async () => {
    storage.set("appSettings", "{");
    expect(loadAppSettings().announcements.enabled).toBe(true);
  });
});
