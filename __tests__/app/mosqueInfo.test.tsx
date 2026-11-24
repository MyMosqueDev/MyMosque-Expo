import MosqueInfoToken from "@/app/components/MosqueInfoToken";
import { getCurrentPrayerTime } from "@/lib/prayerTimeUtils";
import { render, screen } from "@testing-library/react-native";
import {
  eventRow,
  jummah,
  month,
  mosqueRow,
  setNow,
} from "../../test/fixtures";

beforeEach(() => setNow("2026-03-11T13:00:00"));

describe("mosque info", () => {
  const info = () => ({
    hours: mosqueRow().hours,
    events: [eventRow()] as never,
    nextPrayer: getCurrentPrayerTime(month("03-26"), jummah()).nextPrayer,
  });

  it("#44: shows today's hours", () => {
    render(<MosqueInfoToken info={info()} />);
    expect(screen.getByText("Wed hours")).toBeTruthy();
  });

  it("shows both adhan and iqama for the next prayer", () => {
    setNow("2026-03-11T12:50:00");
    render(<MosqueInfoToken info={info()} />);
    expect(screen.getByText("Dhuhr")).toBeTruthy();
    expect(screen.getByText("Adhan 1:00 PM (in 10m)")).toBeTruthy();
    expect(screen.getByText("Iqama 1:30 PM (in 40m)")).toBeTruthy();
  });

  it("drops the adhan countdown once the adhan has passed", () => {
    setNow("2026-03-11T13:10:00");
    render(<MosqueInfoToken info={info()} />);
    expect(screen.getByText("Adhan 1:00 PM")).toBeTruthy();
    expect(screen.getByText("Iqama 1:30 PM (in 20m)")).toBeTruthy();
  });

  it("counts down to tomorrow's fajr after isha", () => {
    setNow("2026-03-11T22:00:00");
    render(<MosqueInfoToken info={info()} />);
    expect(screen.getByText("Adhan 5:30 AM (in 7h 30m)")).toBeTruthy();
    expect(screen.getByText("Iqama 6:00 AM (in 8h)")).toBeTruthy();
  });

  it("labels Jummah on Fridays", () => {
    setNow("2026-03-13T13:00:00");
    render(<MosqueInfoToken info={info()} />);
    expect(screen.getByText("Jummah 1")).toBeTruthy();
    expect(screen.getByText("Adhan 1:15 PM (in 15m)")).toBeTruthy();
  });

  it("KI-14: does not mutate the events it is given", () => {
    const given = info();
    render(<MosqueInfoToken info={given} />);
    expect(given.events[0]).not.toHaveProperty("displayDate");
  });
});
