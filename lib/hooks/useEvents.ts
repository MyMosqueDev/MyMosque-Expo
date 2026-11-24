import { WEEK_CONFIG } from "@/lib/constants";
import { Event } from "@/lib/types";
import { endOfWeek, isWithinInterval, parseISO, startOfWeek } from "date-fns";
import { useState } from "react";

interface UseEventsReturn {
  weekEvents: Event[];
  weekStart: Date;
  setWeekStart: (date: Date) => void;
}

/**
 * Custom hook for browsing events by week
 *
 * @param events - All events to browse
 * @returns The selected week, its events in order, and a way to change it
 */
export function useEvents(events: Event[]): UseEventsReturn {
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), WEEK_CONFIG),
  );

  const weekEnd = endOfWeek(weekStart, WEEK_CONFIG);
  const weekEvents = events
    .filter((event) =>
      isWithinInterval(parseISO(event.date), {
        start: weekStart,
        end: weekEnd,
      }),
    )
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  return { weekEvents, weekStart, setWeekStart };
}
