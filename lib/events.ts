import { Event } from "./types";

// Events have no end time, so allow for one still being under way.
const PAST_AFTER_MS = 3 * 60 * 60 * 1000;

export const isPastEvent = (event: Pick<Event, "date">, now: Date): boolean =>
  now.getTime() - new Date(event.date).getTime() >= PAST_AFTER_MS;
