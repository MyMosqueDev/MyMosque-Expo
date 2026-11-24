import { JummahTime } from "./types";

const KEYS = ["jummah1", "jummah2", "jummah3"] as const;

/**
 * Converts stored Jummah times to the app's format. The portal currently saves
 * `athan` in 24-hour time; `adhan` is accepted too, so it can switch any time.
 * Returns null when the mosque has no Jummah.
 */
export const normalizeJummah = (raw: unknown): JummahTime | null => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const normalized: JummahTime = {};
  for (const key of KEYS) {
    const entry = (raw as Record<string, unknown>)[key];
    if (!entry || typeof entry !== "object") continue;
    const { adhan, athan, iqama } = entry as Record<string, unknown>;
    if (typeof iqama !== "string") continue;
    const start = adhan ?? athan;
    normalized[key] = {
      adhan: typeof start === "string" && start ? to12Hour(start) : "N/A",
      iqama: to12Hour(iqama),
    };
  }
  return normalized;
};

/** "13:30" -> "1:30 PM". Other formats, and the "00:00" marker, are unchanged. */
export const to12Hour = (time: string): string => {
  const match = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match || time === "00:00") return time;
  const hours = Number(match[1]);
  return `${hours % 12 || 12}:${match[2]} ${hours < 12 ? "AM" : "PM"}`;
};
