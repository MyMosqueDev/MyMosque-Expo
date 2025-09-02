import EventToken from "@/app/components/EventToken";
import { ANIMATION_CONFIG, COLORS, LAYOUT } from "@/lib/constants";
import { Event } from "@/lib/types";
import { MotiView } from "moti";
import { ScrollView, Text } from "react-native";

interface EventsListProps {
  events: Event[];
}

/**
 * EventsList component displays a scrollable list of events
 *
 * @param events - Array of events to display
 */
export default function EventsList({ events }: EventsListProps) {
  return (
    <ScrollView
      className="w-full"
      contentContainerStyle={{ paddingBottom: LAYOUT.SCROLL_PADDING_BOTTOM }}
      style={{ overflow: "visible" }}
    >
      {events.length === 0 && (
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            ...ANIMATION_CONFIG.SPRING_STIFF,
            delay: 200,
          }}
        >
          <Text
            className="text-center mt-8"
            style={{ color: COLORS.SECONDARY }}
          >
            No events this week.
          </Text>
        </MotiView>
      )}

      {events.map((event, idx) => (
        <MotiView
          key={`${event.id}-${event.date}-${idx}`}
          from={{ opacity: 0, translateX: -20, scale: 0.95 }}
          animate={{ opacity: 1, translateX: 0, scale: 1 }}
          transition={{
            type: "spring",
            ...ANIMATION_CONFIG.SPRING_STIFF,
            delay: 100 + idx * 100,
          }}
          style={{ overflow: "visible" }}
        >
          <EventToken event={{ ...event, mosqueName: "Filler" }} />
        </MotiView>
      ))}
    </ScrollView>
  );
}
