import { MosqueDataContext } from "@/app/_layout";
import Events from "@/app/(tabs)/events";
import ErrorScreen from "@/app/components/ErrorScreen";
import MosqueInfoToken from "@/app/components/MosqueInfoToken";
import Home from "@/app/home";
import DebugPanel from "@/components/DebugPanel";
import NavBar from "@/components/NavBar";
import { getCurrentPrayerTime } from "@/lib/prayerTimeUtils";
import { syncStorage } from "@/lib/syncStorage";
import { ProcessedMosqueData } from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { ReactElement } from "react";
import { AppState, Platform, TouchableOpacity } from "react-native";
import { State } from "react-native-gesture-handler";
import {
  fireGestureHandler,
  getByGestureTestId,
} from "react-native-gesture-handler/jest-utils";
import { fakeRouter } from "../../test/fakeRouter";
import { fakeSupabase as db } from "../../test/fakeSupabase";
import {
  announcementRow,
  eventRow,
  jummah,
  month,
  MOSQUE_UID,
  monthRow,
  mosqueRow,
  setNow,
} from "../../test/fixtures";

const mosque = (overrides = {}): ProcessedMosqueData =>
  ({
    info: mosqueRow(),
    announcements: [
      announcementRow({
        id: "recent",
        title: "Recent",
        created_at: "2026-03-10T00:00:00Z",
      }),
      announcementRow({
        id: "old",
        title: "Old",
        created_at: "2026-02-01T00:00:00Z",
      }),
    ],
    events: [
      eventRow({
        id: "past",
        title: "Past event",
        date: "2026-03-09T19:00:00-05:00",
      }),
      eventRow({
        id: "next",
        title: "Next event",
        date: "2026-03-12T19:00:00-05:00",
      }),
    ],
    prayerTimes: getCurrentPrayerTime(month("03-26"), jummah()),
    monthlyPrayerSchedule: month("03-26"),
    jummahTimes: jummah(),
    syncStatus: "fresh",
    ...overrides,
  }) as never;

const show = async (ui: ReactElement, data: ProcessedMosqueData | null) => {
  render(
    <MosqueDataContext.Provider
      value={{ mosqueData: data, setMosqueData: () => undefined }}
    >
      {ui}
    </MosqueDataContext.Provider>,
  );
  await act(async () => undefined);
};

const platform = Platform.OS;
beforeEach(() => setNow("2026-03-11T13:00:00"));
afterEach(() => {
  Platform.OS = platform;
});

describe("home", () => {
  it("shows upcoming events and the past week's announcements", async () => {
    await show(<Home />, mosque());
    expect(screen.getAllByText("Next event").length).toBeGreaterThan(0);
    expect(screen.queryByText("Past event")).toBeNull();
    expect(screen.getByText("Recent")).toBeTruthy();
    expect(screen.queryByText("Old")).toBeNull();
  });

  it("shows the next prayer with both times", async () => {
    await show(<Home />, mosque());
    expect(screen.getByText("Adhan 1:00 PM")).toBeTruthy();
    expect(screen.getByText("Iqama 1:30 PM (in 30m)")).toBeTruthy();
  });

  it("hides the next prayer when the mosque has no schedule", async () => {
    await show(<Home />, mosque({ monthlyPrayerSchedule: null }));
    expect(screen.queryByText(/^Iqama /)).toBeNull();
  });

  it("explains when there is nothing upcoming", async () => {
    await show(<Home />, mosque({ events: [], announcements: [] }));
    expect(screen.getByText("No recent event")).toBeTruthy();
    expect(screen.getByText("No upcoming events")).toBeTruthy();
  });

  it("links to each screen without carrying data", async () => {
    await show(<Home />, mosque());
    screen.getAllByText("View More").forEach((l) => fireEvent.press(l));
    expect(fakeRouter.navigations.map(([, href]) => href)).toEqual(
      expect.arrayContaining(["/prayer", "/announcements", "/events"]),
    );
  });

  it("shows an error without a mosque", async () => {
    await show(<Home />, null);
    expect(screen.getByText(/No mosque data found/)).toBeTruthy();
  });
});

describe("mosque info", () => {
  const info = (date: string) => ({
    hours: mosqueRow().hours,
    events: [eventRow({ date })] as never,
    nextPrayer: null,
  });

  it.each([
    ["2026-03-11T19:00:00", "Today @ 7:00 PM"],
    ["2026-03-12T19:00:00", "Tomorrow @ 7:00 PM"],
    ["2026-03-14T19:00:00", "Saturday @ 7:00 PM"],
    ["2026-03-25T19:00:00", "Mar 25 @ 7:00 PM"],
  ])("describes an event at %s as %s", (date, expected) => {
    Platform.OS = "android";
    render(<MosqueInfoToken info={info(date)} />);
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it("omits the adhan line when its time is unknown", () => {
    const times = getCurrentPrayerTime(month("03-26"), jummah());
    render(
      <MosqueInfoToken
        info={{
          ...info("2026-03-12T19:00:00"),
          events: null,
          nextPrayer: { ...times.nextPrayer, adhan: "N/A" },
        }}
      />,
    );
    expect(screen.queryByText(/^Adhan/)).toBeNull();
  });

  it("drops an event that has passed when the app returns", () => {
    const listeners: ((s: string) => void)[] = [];
    jest.spyOn(AppState, "addEventListener").mockImplementation(((
      _t: string,
      l: (s: string) => void,
    ) => {
      listeners.push(l);
      return { remove: () => undefined };
    }) as never);
    render(<MosqueInfoToken info={info("2026-03-11T19:00:00")} />);
    setNow("2026-03-11T20:00:00");
    act(() => listeners.forEach((l) => l("active")));
    expect(screen.getByText("No upcoming events")).toBeTruthy();
  });
});

describe("events", () => {
  it("browses between weeks", async () => {
    await show(<Events />, mosque());
    expect(screen.getByText("Next event")).toBeTruthy();
    const buttons = screen.UNSAFE_getAllByType(TouchableOpacity);
    const chevrons = buttons.filter((b) => b.props.className === undefined);
    const [back, forward] = chevrons.slice(-2);
    fireEvent.press(forward);
    expect(screen.getByText("No events this week.")).toBeTruthy();
    fireEvent.press(back);
    expect(screen.getByText("Next event")).toBeTruthy();
  });

  it.each([
    [100, "March 1st - 7th"],
    [-100, "March 15th - 21st"],
    [20, "March 8th - 14th"],
  ])("a swipe of %i shows %s", async (translationX, week) => {
    await show(<Events />, mosque());
    act(() =>
      fireGestureHandler(getByGestureTestId("week-swipe"), [
        { state: State.BEGAN, translationX: 0 },
        { state: State.ACTIVE, translationX },
        { state: State.END, translationX },
      ]),
    );
    expect(screen.getByText(week)).toBeTruthy();
  });

  it("orders events within the week", async () => {
    await show(
      <Events />,
      mosque({
        events: [
          eventRow({
            id: "b",
            title: "Second",
            date: "2026-03-13T10:00:00-05:00",
          }),
          eventRow({
            id: "a",
            title: "First",
            date: "2026-03-12T10:00:00-05:00",
          }),
        ],
      }),
    );
    const titles = screen
      .getAllByText(/^(First|Second)$/)
      .map((t) => t.props.children);
    expect(titles.slice(0, 2)).toEqual(["First", "Second"]);
  });

  it("shows a loading state until data arrives", async () => {
    await show(<Events />, null);
    expect(screen.getByText("Loading...")).toBeTruthy();
  });
});

describe("KI-9: nav bar", () => {
  it.each(["/", "/events", "/prayer", "/notifs", "/elsewhere"])(
    "links without data on %s",
    (path) => {
      fakeRouter.pathname = path;
      Platform.OS = path === "/events" ? "android" : "ios";
      render(<NavBar />);
      expect(fakeRouter.hrefs).toEqual(["/", "/events", "/prayer"]);
    },
  );

  it.each(["/announcements", "/map", "/settings"])(
    "is hidden on %s",
    (path) => {
      fakeRouter.pathname = path;
      render(<NavBar />);
      expect(screen.toJSON()).toBeNull();
    },
  );
});

describe("error screen", () => {
  it("offers a retry during startup", () => {
    const onRetry = jest.fn();
    render(<ErrorScreen error="Boom" onRetry={onRetry} />);
    fireEvent.press(screen.getByText("Try again"));
    expect(onRetry).toHaveBeenCalled();
  });

  it("offers the mosque switcher otherwise", async () => {
    await show(<ErrorScreen error="Boom" />, null);
    expect(screen.queryByText("Try again")).toBeNull();
    fireEvent.press(screen.UNSAFE_getAllByType(TouchableOpacity)[0]);
    expect(fakeRouter.navigations).toEqual([["replace", "/map"]]);
  });
});

it("debug panel reports when the last sync really happened", async () => {
  db.tables = {
    mosques: [mosqueRow()],
    announcements: [],
    events: [],
    new_prayer_times: [monthRow("03-26")],
  };
  await AsyncStorage.setItem(
    "userData",
    JSON.stringify({ lastVisitedMosque: MOSQUE_UID }),
  );
  await syncStorage(MOSQUE_UID);
  render(<DebugPanel visible onClose={() => undefined} />);
  await waitFor(() => screen.getByText("Sync Status"));
  fireEvent.press(screen.getByText("Sync Status"));
  expect(screen.getByText(new Date().toLocaleString())).toBeTruthy();
  expect(screen.getByText("Test Mosque")).toBeTruthy();
});
