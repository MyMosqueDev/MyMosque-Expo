import { normalizeJummah, to12Hour } from "@/lib/jummah";
import fc from "fast-check";
import { jummah, storedJummah } from "../../test/fixtures";

describe("normalizeJummah", () => {
  it("converts the portal's format", () => {
    expect(normalizeJummah(storedJummah())).toEqual(jummah());
  });

  it("leaves normalized times unchanged", () => {
    expect(normalizeJummah(jummah())).toEqual(jummah());
  });

  it("prefers adhan when both spellings are present", () => {
    const both = {
      jummah1: { athan: "13:00", adhan: "13:15", iqama: "13:45" },
    };
    expect(normalizeJummah(both)?.jummah1?.adhan).toBe("1:15 PM");
  });

  it("marks a missing adhan as unknown", () => {
    expect(normalizeJummah({ jummah1: { iqama: "13:45" } })).toEqual({
      jummah1: { adhan: "N/A", iqama: "1:45 PM" },
    });
  });

  it.each([null, undefined, "13:45", 5, []])(
    "treats %j as no Jummah",
    (raw) => {
      expect(normalizeJummah(raw)).toBeNull();
    },
  );

  it("skips entries it cannot read", () => {
    expect(
      normalizeJummah({ jummah1: null, jummah2: "x", jummah3: { iqama: 5 } }),
    ).toEqual({});
  });
});

describe("to12Hour", () => {
  it.each([
    ["13:30", "1:30 PM"],
    ["00:15", "12:15 AM"],
    ["12:00", "12:00 PM"],
    ["09:05", "9:05 AM"],
    ["13:30:00", "1:30 PM"],
    ["1:30 PM", "1:30 PM"],
    ["N/A", "N/A"],
    ["00:00", "00:00"], // the app's marker for an unknown time
  ])("%s -> %s", (time, expected) => {
    expect(to12Hour(time)).toBe(expected);
  });

  it("never changes a time that is already 12-hour", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 12 }),
        fc.integer({ min: 0, max: 59 }),
        fc.constantFrom("AM", "PM"),
        (h, m, period) => {
          const time = `${h}:${String(m).padStart(2, "0")} ${period}`;
          expect(to12Hour(time)).toBe(time);
        },
      ),
    );
  });
});
