import { isPastEvent } from "@/lib/events";
import { eventRow } from "../../test/fixtures";

const event = eventRow({ date: "2026-03-11T19:00:00-05:00" });

it.each([
  ["before it starts", "2026-03-11T18:59:00-05:00", false],
  ["while it is on", "2026-03-11T20:30:00-05:00", false],
  ["just under three hours in", "2026-03-11T21:59:59-05:00", false],
  ["three hours after it starts", "2026-03-11T22:00:00-05:00", true],
  ["days later", "2026-03-14T09:00:00-05:00", true],
])("%s", (_label, now, expected) => {
  expect(isPastEvent(event, new Date(now))).toBe(expected);
});

it("compares moments, not local clock times", () => {
  const utc = { date: "2026-03-12T00:00:00Z" };
  expect(isPastEvent(utc, new Date("2026-03-11T22:00:00-05:00"))).toBe(true);
  expect(isPastEvent(utc, new Date("2026-03-11T21:00:00-05:00"))).toBe(false);
});

it("does not mark an unreadable date as past", () => {
  expect(isPastEvent({ date: "soon" }, new Date())).toBe(false);
});
