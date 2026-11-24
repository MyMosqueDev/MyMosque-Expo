import Settings from "@/app/settings";
import { DevModeProvider } from "@/lib/devMode";
import { loadAppSettings } from "@/lib/appSettings";
import { storage } from "@/lib/mmkv";
import {
  loadPrayerNotificationSettings,
  DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
  savePrayerNotificationSettings,
  schedulePrayerNotifications,
} from "@/lib/prayerNotifications";
import { syncStorage } from "@/lib/syncStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Alert, Linking, Switch } from "react-native";
import { fakeNotifications as os } from "../../test/fakeNotifications";
import { fakeSupabase as db } from "../../test/fakeSupabase";
import { MOSQUE_UID, monthRow, mosqueRow, setNow } from "../../test/fixtures";

jest.mock("@react-navigation/native", () => {
  const { useEffect } = jest.requireActual("react");
  return {
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
  };
});

const EVENTS = 0;
const PRAYERS = 2;
const toggle = (index: number, value: boolean) =>
  fireEvent(screen.UNSAFE_getAllByType(Switch)[index], "valueChange", value);
const settle = (ms = 30) => act(() => new Promise((r) => setTimeout(r, ms)));
let post: jest.Mock;

beforeEach(async () => {
  post = jest.fn(async () => ({ ok: true, status: 200 }));
  global.fetch = post as never;
  setNow("2026-03-11T12:00:00");
  db.tables = {
    mosques: [mosqueRow()],
    announcements: [],
    events: [],
    new_prayer_times: [monthRow("03-26")],
  };
  await AsyncStorage.setItem(
    "userData",
    JSON.stringify({ favoriteMosques: [], lastVisitedMosque: MOSQUE_UID }),
  );
  await syncStorage(MOSQUE_UID);
});

const open = async () => {
  render(<Settings />);
  await waitFor(() => screen.getByText("Event Notifications"));
};

it("saves a change even when leaving immediately", async () => {
  await open();
  toggle(EVENTS, false);
  screen.unmount();
  await settle();
  expect((await loadAppSettings()).events.enabled).toBe(false);
});

it("KI-8: registers the change even when leaving immediately", async () => {
  await open();
  toggle(EVENTS, false);
  screen.unmount();
  await settle();
  const last = JSON.parse(post.mock.calls.at(-1)![1].body);
  expect(last.settings.events.enabled).toBe(false);
});

it("KI-12: turning reminders off sticks even when leaving immediately", async () => {
  savePrayerNotificationSettings({
    ...DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
    enabled: true,
  });
  await schedulePrayerNotifications(MOSQUE_UID, "Test Mosque");
  expect(os.scheduled.length).toBeGreaterThan(0);
  await open();
  toggle(PRAYERS, false);
  screen.unmount();
  await settle();
  expect(loadPrayerNotificationSettings().enabled).toBe(false);
  expect(os.scheduled).toEqual([]);
});

it("KI-14: a change does not leak into the defaults", async () => {
  await open();
  toggle(EVENTS, false);
  screen.unmount();
  await settle();
  storage.clearAll();
  await AsyncStorage.removeItem("appSettings");
  expect((await loadAppSettings()).events.enabled).toBe(true);
});

it.each(["granted", "denied", "undetermined", "other"])(
  "describes %s notification permission",
  async (permission) => {
    os.permission = permission;
    await open();
    const label = {
      granted: "Enabled",
      denied: "Disabled",
      undetermined: "Not Set",
    }[permission];
    await waitFor(() => screen.getByText(label ?? "Unknown"));
  },
);

it("offers to open the device settings", async () => {
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  const openSettings = jest.spyOn(Linking, "openSettings").mockResolvedValue();
  await open();
  fireEvent.press(screen.getByText("Device notification permissions"));
  alert.mock.calls[0][2]![1].onPress!();
  expect(openSettings).toHaveBeenCalled();
});

it("saves each prayer and Jummah toggle", async () => {
  savePrayerNotificationSettings({
    ...DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
    enabled: true,
  });
  await open();
  const count = screen.UNSAFE_getAllByType(Switch).length;
  expect(count).toBe(3 + 5 + 2);
  for (let i = PRAYERS + 1; i < count; i++) toggle(i, false);
  const { prayers, jummah } = loadPrayerNotificationSettings();
  expect(Object.values(prayers)).toEqual(Array(5).fill(false));
  expect([jummah.jummah1, jummah.jummah2]).toEqual([false, false]);
});

it("applies changes after a pause, once per burst", async () => {
  await open();
  toggle(1, false);
  toggle(1, true);
  toggle(1, false);
  await settle(700);
  expect(post).toHaveBeenCalledTimes(1);
  expect(
    JSON.parse(post.mock.calls[0][1].body).settings.announcements.enabled,
  ).toBe(false);
});

it("sends nothing when leaving without changes", async () => {
  await open();
  screen.unmount();
  await settle();
  expect(post).not.toHaveBeenCalled();
});

it("opens from saved data when offline", async () => {
  db.goOffline();
  await open();
  expect(screen.getByText("Test Mosque")).toBeTruthy();
});

it("opens the support and source links", async () => {
  const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
  await open();
  fireEvent.press(screen.getByText("Contact Support"));
  fireEvent.press(screen.getByText("Source Code"));
  expect(openURL).toHaveBeenCalledTimes(2);
});

describe("development mode", () => {
  const submit = async (password: string) => {
    const alert = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => undefined);
    render(
      <DevModeProvider>
        <Settings />
      </DevModeProvider>,
    );
    await waitFor(() => screen.getByText("Event Notifications"));
    fireEvent.press(screen.getByText("Enable"));
    fireEvent.changeText(
      screen.getByPlaceholderText("Enter password"),
      password,
    );
    fireEvent.press(screen.getByText("Submit"));
    await settle();
    return alert.mock.calls.map(([title]) => title);
  };

  it("rejects a wrong password", async () => {
    expect(await submit("nope")).toEqual(["Incorrect Password"]);
    expect(screen.getByText("Enable")).toBeTruthy();
  });

  it("can be turned off again", async () => {
    await AsyncStorage.setItem("devModeEnabled", "true");
    jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
    render(
      <DevModeProvider>
        <Settings />
      </DevModeProvider>,
    );
    await waitFor(() => screen.getByText("Disable"));
    fireEvent.press(screen.getByText("Disable"));
    await waitFor(() => screen.getByText("Enable"));
  });
});
