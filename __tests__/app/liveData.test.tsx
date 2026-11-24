// Uses the real router: these bugs live in how links carried data.
import { MosqueDataContext } from "@/app/_layout";
import Announcements from "@/app/announcements";
import Events from "@/app/(tabs)/events";
import Prayers from "@/app/(tabs)/prayer";
import { getCurrentPrayerTime } from "@/lib/prayerTimeUtils";
import { act, screen } from "@testing-library/react-native";
import { router, Slot } from "expo-router";
import { renderRouter } from "expo-router/testing-library";
import { useState } from "react";
import { Text } from "react-native";
import {
  announcementRow,
  eventRow,
  jummah,
  month,
  mosqueRow,
  setNow,
} from "../../test/fixtures";

jest.unmock("expo-router");

let setData: (data: any) => void;
const schedule = month("03-26");
schedule.prayer_times[11].times.asr.iqama = "5:15 PM";

const data = (overrides = {}) => ({
  info: mosqueRow(),
  announcements: [announcementRow()],
  events: [eventRow({ date: "2026-03-12T19:00:00-05:00" })],
  prayerTimes: getCurrentPrayerTime(schedule, jummah()),
  monthlyPrayerSchedule: schedule,
  jummahTimes: jummah(),
  ...overrides,
});

const Layout = () => {
  const [mosqueData, setMosqueData] = useState<any>(null);
  setData = setMosqueData;
  return (
    <MosqueDataContext.Provider value={{ mosqueData, setMosqueData }}>
      <Slot />
    </MosqueDataContext.Provider>
  );
};

const open = (path: string, initial = {}) => {
  renderRouter(
    {
      _layout: Layout,
      index: () => <Text>home</Text>,
      announcements: Announcements,
      prayer: Prayers,
      events: Events,
    },
    { initialUrl: "/" },
  );
  setNow("2026-03-11T13:00:00"); // renderRouter resets the clock
  act(() => setData(data(initial)));
  act(() => router.push(path as never));
};

it("shows an announcement that arrives while the screen is open", () => {
  open("/announcements");
  act(() =>
    setData(
      data({
        announcements: [
          announcementRow(),
          announcementRow({ id: "a2", title: "Janazah today" }),
        ],
      }),
    ),
  );
  expect(screen.getByText("Janazah today")).toBeTruthy();
});

it("shows the new day's times on a prayer screen left open overnight", () => {
  open("/prayer");
  expect(screen.getByText("4:30")).toBeTruthy();
  setNow("2026-03-12T09:00:00");
  act(() => setData(data()));
  expect(screen.getByText("5:15")).toBeTruthy();
});

it("opens events directly, without link data", () => {
  open("/events");
  expect(screen.getByText("Halaqa")).toBeTruthy();
});

it.each([
  "https://x.org/My%20Flyer.png",
  "https://x.org/?q=%22Eid%22",
  "mailto:a@x.org?body=Salam%0AI%20will",
  "Tickets 50% off",
])("shows content unaltered: %s", (description) => {
  open("/announcements", { announcements: [announcementRow({ description })] });
  expect(screen.getByText(description)).toBeTruthy();
});

it("keeps showing events when one contains encoded characters", () => {
  open("/events", {
    events: [
      eventRow({
        date: "2026-03-12T19:00:00-05:00",
        description: "https://x.org/?q=%22Eid%22",
      }),
    ],
  });
  expect(screen.getByText("Halaqa")).toBeTruthy();
});
