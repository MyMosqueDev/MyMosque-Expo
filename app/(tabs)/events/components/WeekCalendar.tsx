import { ANIMATION_CONFIG, COLORS, DAY_LABELS, LAYOUT } from '@/lib/constants';
import { Event } from '@/lib/types';
import { addDays, isSameDay, parseISO } from 'date-fns';
import { MotiView } from 'moti';
import { Text, View } from 'react-native';

interface WeekCalendarProps {
  weekStart: Date;
  events: Event[];
}

/**
 * WeekCalendar component displays a week view with event indicators
 * 
 * @param weekStart - The start date of the week to display
 * @param events - Array of events to check for day indicators
 */
export default function WeekCalendar({ weekStart, events }: WeekCalendarProps) {
  // Generate array of dates for the week
  const weekDates = Array.from({ length: LAYOUT.WEEK_DAYS }, (_, i) => addDays(weekStart, i));

  // Check if a specific day has any events
  const dayHasEvent = (date: Date) => {
    return events.some(event => isSameDay(parseISO(event.date), date));
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', ...ANIMATION_CONFIG.TIMING }}
      className="w-full"
    >
      <View className="flex-row justify-between w-full px-4 mb-4">
        {weekDates.map((date, idx) => (
          <View key={idx} className="items-center flex-1">
            <Text className="text-xs font-lato-bold mb-1" style={{ color: COLORS.SECONDARY }}>
              {DAY_LABELS[idx]}
            </Text>
            <View className="rounded-full w-9 h-9 items-center justify-center">
              <Text 
                className="text-lg font-lato-bold"
                style={{ 
                  color: dayHasEvent(date) ? COLORS.PRIMARY : COLORS.SECONDARY_OPACITY 
                }}
              >
                {date.getDate()}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </MotiView>
  );
} 