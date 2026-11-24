import { MosqueDataContext } from "@/app/_layout";
import Announcements from "@/app/announcements";
import Prayers from "@/app/(tabs)/prayer";
import { ProcessedMosqueData } from "@/lib/types";
import { getCurrentPrayerTime } from "@/lib/prayerTimeUtils";
import { render, screen } from "@testing-library/react-native";
import { ReactElement } from "react";
import {
  announcementRow,
  eventRow,
  jummah,
  month,
  mosqueRow,
  setNow,
} from "../../test/fixtures";

const mosque = (): ProcessedMosqueData =>
  ({
    info: mosqueRow(),
    announcements: [announcementRow()],
    events: [eventRow()],
    prayerTimes: getCurrentPrayerTime(month("03-26"), jummah()),
    monthlyPrayerSchedule: month("03-26"),
    jummahTimes: jummah(),
  }) as never;

const show = (ui: ReactElement, data: ProcessedMosqueData | null = mosque()) =>
  render(
    <MosqueDataContext.Provider
      value={{ mosqueData: data, setMosqueData: () => undefined }}
    >
      {ui}
    </MosqueDataContext.Provider>,
  );

const firstText = (label: string) => screen.getAllByText(label)[0];

beforeEach(() => setNow("2026-03-11T13:00:00"));

describe("prayer screen", () => {
  it("shows today's times and the countdown from shared data", () => {
    show(<Prayers />);
    expect(screen.getByText("4:30")).toBeTruthy();
    expect(screen.getByText("30 minutes")).toBeTruthy();
  });

  it("replaces Dhuhr with Jummah on Fridays", () => {
    setNow("2026-03-13T13:00:00");
    show(<Prayers />);
    expect(firstText("Jummah 1")).toBeTruthy();
    expect(screen.queryByText("Dhuhr")).toBeNull();
  });

  it("KI-7: renders for a mosque without Jummah", () => {
    const data = mosque();
    data.prayerTimes.jummah = null as never;
    show(<Prayers />, data);
    expect(firstText("Dhuhr")).toBeTruthy();
    expect(screen.queryByText(/Jummah/)).toBeNull();
  });

  it("shows the outdated-schedule warning", () => {
    const data = mosque();
    data.prayerTimes.warning = "Current prayer times may be outdated";
    show(<Prayers />, data);
    expect(screen.getByText(/may be outdated/)).toBeTruthy();
  });

  it("shows N/A for times the mosque has not provided", () => {
    const data = mosque();
    data.prayerTimes.jummah = { jummah1: { iqama: "1:45 PM" } } as never;
    data.prayerTimes.asr = {} as never;
    show(<Prayers />, data);
    expect(screen.getAllByText("N/A").length).toBe(3);
  });

  it("shows a loading state until data arrives", () => {
    show(<Prayers />, null);
    expect(screen.getByText("Loading...")).toBeTruthy();
  });
});

describe("announcements screen", () => {
  it("lists shared announcements", () => {
    show(<Announcements />);
    expect(screen.getByText("Parking update")).toBeTruthy();
  });

  it("KI-9: renders before data arrives", () => {
    expect(() => show(<Announcements />, null)).not.toThrow();
  });

  it("KI-14: spells its title correctly", () => {
    show(<Announcements />);
    expect(screen.getByText("Announcements")).toBeTruthy();
  });
});
