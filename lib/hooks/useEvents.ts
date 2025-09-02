import { WEEK_CONFIG } from "@/lib/constants";
import { Event } from "@/lib/types";
import { endOfWeek, isWithinInterval, parseISO, startOfWeek } from "date-fns";
import { useEffect, useState } from "react";

interface UseEventsReturn {
  events: Event[];
  weekEvents: Event[];
  isLoading: boolean;
  weekStart: Date;
  setWeekStart: (date: Date) => void;
}

/**
 * Custom hook for managing events data and week filtering
 *
 * @param eventsParam - Events data from URL parameters
 * @returns Object containing events state and week management functions
 */
export function useEvents(
  eventsParam: string | string[] | undefined,
): UseEventsReturn {
  const [weekStart, setWeekStart] = useState<Date>(
    startOfWeek(new Date(), WEEK_CONFIG),
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Parse events from URL parameters
  useEffect(() => {
    if (eventsParam) {
      try {
        const parsedEvents = JSON.parse(eventsParam as string);
        setEvents(parsedEvents);
      } catch (error) {
        console.error("Error parsing events:", error);
        setEvents([]);
      }
    }
    setIsLoading(false);
  }, [eventsParam]);

  // Filter events for the current week
  const weekEnd = endOfWeek(weekStart, WEEK_CONFIG);
  const weekEvents = events
    .filter((event) => {
      const eventDate = parseISO(event.date);
      return isWithinInterval(eventDate, { start: weekStart, end: weekEnd });
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  return {
    events,
    weekEvents,
    isLoading,
    weekStart,
    setWeekStart,
  };
}
