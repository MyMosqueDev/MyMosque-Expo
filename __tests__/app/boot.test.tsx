import RootLayout, { useMosqueData } from "@/app/_layout";
import { syncStorage } from "@/lib/syncStorage";
import {
  DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
  savePrayerNotificationSettings,
} from "@/lib/prayerNotifications";
import { storage } from "@/lib/mmkv";
import { fakeNotifications } from "../../test/fakeNotifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { AppState, Text } from "react-native";
import { fakeRouter } from "../../test/fakeRouter";
import { fakeSupabase as db } from "../../test/fakeSupabase";
import {
  announcementRow,
  month,
  MOSQUE_UID,
  monthRow,
  mosqueRow,
  setNow,
} from "../../test/fixtures";

const Probe = () => {
  const { mosqueData } = useMosqueData();
  return (
    <Text>
      {mosqueData
        ? `${mosqueData.info.name}: ${mosqueData.announcements.length}`
        : "no mosque"}
    </Text>
  );
};

const Asr = () => (
  <Text>{useMosqueData().mosqueData?.prayerTimes.asr.iqama}</Text>
);

let listeners: ((state: string) => void)[];
const foreground = () =>
  act(async () => {
    listeners.forEach((l) => l("active"));
    await new Promise((r) => setTimeout(r, 20));
  });
const chooseMosque = () =>
  AsyncStorage.setItem(
    "userData",
    JSON.stringify({ favoriteMosques: [], lastVisitedMosque: MOSQUE_UID }),
  );

beforeEach(() => {
  setNow("2026-03-11T12:00:00");
  listeners = [];
  jest.spyOn(AppState, "addEventListener").mockImplementation(((
    _type: string,
    listener: (state: string) => void,
  ) => {
    listeners.push(listener);
    return { remove: () => undefined };
  }) as never);
  fakeRouter.screen = <Probe />;
  db.tables = {
    mosques: [mosqueRow()],
    announcements: [announcementRow()],
    events: [],
    new_prayer_times: [monthRow("03-26")],
  };
});

it("starts without a chosen mosque", async () => {
  render(<RootLayout />);
  await waitFor(() => expect(screen.getByText("no mosque")).toBeTruthy());
});

it("loads the chosen mosque", async () => {
  await chooseMosque();
  render(<RootLayout />);
  await waitFor(() => expect(screen.getByText("Test Mosque: 1")).toBeTruthy());
});

it("picks up new content on foreground", async () => {
  await chooseMosque();
  render(<RootLayout />);
  await waitFor(() => screen.getByText("Test Mosque: 1"));
  const at = "2026-03-11T18:00:00+00:00";
  db.tables.announcements.push(announcementRow({ id: "a2", created_at: at }));
  db.tables.mosques[0].last_announcement = at;
  await foreground();
  expect(screen.getByText("Test Mosque: 2")).toBeTruthy();
});

describe("KI-2: offline", () => {
  it("starts from the cache", async () => {
    await chooseMosque();
    await syncStorage(MOSQUE_UID);
    db.goOffline();
    render(<RootLayout />);
    await waitFor(() =>
      expect(screen.getByText("Test Mosque: 1")).toBeTruthy(),
    );
  });

  it("keeps the current screen when a foreground refresh fails", async () => {
    await chooseMosque();
    render(<RootLayout />);
    await waitFor(() => screen.getByText("Test Mosque: 1"));
    storage.clearAll(); // even without a usable cache
    db.goOffline();
    await foreground();
    expect(screen.getByText("Test Mosque: 1")).toBeTruthy();
  });

  it("recovers from the error screen once back online", async () => {
    await chooseMosque();
    db.goOffline();
    render(<RootLayout />);
    await waitFor(() => screen.getByText("Something went wrong"));
    db.goOnline();
    await foreground();
    expect(screen.queryByText("Something went wrong")).toBeNull();
    expect(screen.getByText("Test Mosque: 1")).toBeTruthy();
  });
});

it("KI-5: survives foregrounding on the 31st with a 28-day month", async () => {
  await chooseMosque();
  db.tables.new_prayer_times = [{ ...monthRow("02-26", 28) }];
  setNow("2026-03-28T12:00:00");
  storage.set(
    `mosqueData-${MOSQUE_UID}`,
    JSON.stringify({
      info: mosqueRow(),
      announcements: [],
      events: [],
      monthlyPrayerSchedule: month("02-26", 28),
      jummahTimes: mosqueRow().jummah_times,
    }),
  );
  render(<RootLayout />);
  await waitFor(() => screen.getByText(/Test Mosque/));
  setNow("2026-03-31T12:00:00");
  await foreground();
  expect(screen.getByText(/Test Mosque/)).toBeTruthy();
});

it("KI-13: syncs once at startup", async () => {
  await chooseMosque();
  render(<RootLayout />);
  await waitFor(() => screen.getByText("Test Mosque: 1"));
  await act(() => new Promise((r) => setTimeout(r, 30)));
  expect(db.countQueries("mosques")).toBe(1);
});

describe("while the app stays open", () => {
  const advance = (ms: number) =>
    act(async () => {
      await jest.advanceTimersByTimeAsync(ms);
    });
  const MINUTE = 60_000;

  beforeEach(async () => {
    await chooseMosque();
    jest.useFakeTimers({ now: new Date("2026-03-11T12:00:00") });
  });

  it("retries a failed sync within about a minute", async () => {
    await syncStorage(MOSQUE_UID);
    db.goOffline();
    render(<RootLayout />);
    await advance(100);
    screen.getByText("Test Mosque: 1");
    const at = "2026-03-11T18:00:00+00:00";
    db.tables.announcements.push(announcementRow({ id: "a2", created_at: at }));
    db.tables.mosques[0].last_announcement = at;
    db.goOnline();
    await advance(MINUTE + 1000);
    expect(screen.getByText("Test Mosque: 2")).toBeTruthy();
  });

  it("checks for updates every 15 minutes", async () => {
    render(<RootLayout />);
    await advance(100);
    const before = db.countQueries("mosques");
    await advance(10 * MINUTE);
    expect(db.countQueries("mosques")).toBe(before);
    await advance(6 * MINUTE);
    expect(db.countQueries("mosques")).toBe(before + 1);
  });

  it("rolls prayer times over without any network", async () => {
    const schedule = monthRow("03-26");
    schedule.prayer_times[11].times.asr.iqama = "5:15 PM";
    db.tables.new_prayer_times = [schedule];
    fakeRouter.screen = <Asr />;
    jest.setSystemTime(new Date("2026-03-11T23:59:00"));
    render(<RootLayout />);
    await advance(100);
    screen.getByText("4:30 PM");
    db.goOffline();
    await advance(2 * MINUTE);
    expect(screen.getByText("5:15 PM")).toBeTruthy();
  });

  it("keeps a slow sync's result when times refresh meanwhile", async () => {
    render(<RootLayout />);
    await advance(100);
    const at = "2026-03-11T18:00:00+00:00";
    db.tables.announcements.push(announcementRow({ id: "a2", created_at: at }));
    db.tables.mosques[0].last_announcement = at;
    db.latencyMs = 45_000; // two requests in a row span a minute tick
    await act(async () => listeners.forEach((l) => l("active")));
    await advance(3 * MINUTE);
    expect(screen.getByText("Test Mosque: 2")).toBeTruthy();
  });

  it("keeps a mosque chosen while a sync is running", async () => {
    let choose: (data: any) => void;
    const Chooser = () => {
      const { mosqueData, setMosqueData } = useMosqueData();
      choose = () =>
        setMosqueData({
          ...mosqueData!,
          info: { ...mosqueData!.info, uid: "other", name: "Other Mosque" },
        });
      return <Probe />;
    };
    fakeRouter.screen = <Chooser />;
    render(<RootLayout />);
    await advance(100);
    db.latencyMs = 5_000;
    await act(async () => listeners.forEach((l) => l("active")));
    await advance(1_000);
    act(() => choose({}));
    await advance(10_000);
    expect(screen.getByText("Other Mosque: 1")).toBeTruthy();
  });

  it("does not poll in the background", async () => {
    render(<RootLayout />);
    await advance(100);
    await act(async () => listeners.forEach((l) => l("background")));
    const before = db.countQueries("mosques");
    await advance(60 * MINUTE);
    expect(db.countQueries("mosques")).toBe(before);
  });
});

it("lets the user retry from the startup error", async () => {
  await chooseMosque();
  db.goOffline();
  render(<RootLayout />);
  await waitFor(() => screen.getByText("Try again"));
  db.goOnline();
  fireEvent.press(screen.getByText("Try again"));
  await waitFor(() => expect(screen.getByText("Test Mosque: 1")).toBeTruthy());
});

describe("reminders", () => {
  beforeEach(async () => {
    await chooseMosque();
    await syncStorage(MOSQUE_UID); // already saved, so this start changes nothing
    savePrayerNotificationSettings({
      ...DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
      enabled: true,
    });
  });

  it("are extended on every cold start", async () => {
    render(<RootLayout />);
    await waitFor(() => screen.getByText("Test Mosque: 1"));
    await waitFor(() =>
      expect(fakeNotifications.scheduled.length).toBeGreaterThan(0),
    );
  });

  it("are extended offline too", async () => {
    db.goOffline();
    render(<RootLayout />);
    await waitFor(() =>
      expect(fakeNotifications.scheduled.length).toBeGreaterThan(0),
    );
  });

  it("stay off when disabled", async () => {
    savePrayerNotificationSettings(DEFAULT_PRAYER_NOTIFICATION_SETTINGS);
    render(<RootLayout />);
    await waitFor(() => screen.getByText("Test Mosque: 1"));
    await act(() => new Promise((r) => setTimeout(r, 30)));
    expect(fakeNotifications.scheduled).toEqual([]);
  });
});

describe("push registration", () => {
  let post: jest.Mock;
  beforeEach(() => {
    post = jest.fn(async () => ({ ok: true, status: 200 }));
    global.fetch = post as never;
  });

  it("registers at startup without visiting Settings", async () => {
    await chooseMosque();
    render(<RootLayout />);
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
  });

  it("retries on foreground after a failure", async () => {
    await chooseMosque();
    post.mockRejectedValueOnce(new Error("offline"));
    render(<RootLayout />);
    await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
    await act(async () => listeners.forEach((l) => l("active")));
    await waitFor(() => expect(post).toHaveBeenCalledTimes(2));
  });
});
