import EmptyToken from "@/app/components/EmptyToken";
import PrayerToken from "@/app/components/PrayerToken";
import { getCurrentPrayerTime } from "@/lib/prayerTimeUtils";
import { render, screen } from "@testing-library/react-native";
import { jummah, month, setNow } from "../../test/fixtures";

describe("home prayer bar", () => {
  const bar = (now: string) => {
    setNow(now);
    render(
      <PrayerToken
        prayerTimes={getCurrentPrayerTime(month("03-26"), jummah())}
      />,
    );
  };

  it("shows Dhuhr on ordinary days", () => {
    bar("2026-03-11T13:00:00");
    expect(screen.getByText("Dhuhr")).toBeTruthy();
    expect(screen.getByText("1:30")).toBeTruthy();
  });

  it.each([
    ["2026-03-13T13:00:00", "1:45"],
    ["2026-03-13T14:00:00", "2:45"],
    ["2026-03-13T16:00:00", "1:45"],
  ])("KI-4: at %s on Friday shows Jummah %s instead", (now, time) => {
    bar(now);
    expect(screen.getByText("Jummah")).toBeTruthy();
    expect(screen.getByText(time)).toBeTruthy();
    expect(screen.queryByText("Dhuhr")).toBeNull();
  });
});

it.each(["announcement", "event"] as const)(
  "KI-1: renders an empty %s",
  (t) => {
    render(<EmptyToken type={t} />);
    expect(screen.getByText(`No recent ${t}`)).toBeTruthy();
  },
);
