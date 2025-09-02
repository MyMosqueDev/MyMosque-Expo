import { ANIMATION_CONFIG, COLORS, WEEK_CONFIG } from "@/lib/constants";
import { Feather } from "@expo/vector-icons";
import { addDays, endOfWeek, format } from "date-fns";
import { MotiView } from "moti";
import { Text, TouchableOpacity, View } from "react-native";

interface WeekNavigatorProps {
  weekStart: Date;
  onWeekChange: (newWeekStart: Date) => void;
}

/**
 * WeekNavigator component for browsing through weeks
 *
 * @param weekStart - The start date of the current week
 * @param onWeekChange - Callback when user navigates to a different week
 */
export default function WeekNavigator({
  weekStart,
  onWeekChange,
}: WeekNavigatorProps) {
  const weekEnd = endOfWeek(weekStart, WEEK_CONFIG);
  const weekLabel = `${format(weekStart, "MMMM do")} - ${format(weekEnd, "do")}`;

  const handlePreviousWeek = () => {
    onWeekChange(addDays(weekStart, -7));
  };

  const handleNextWeek = () => {
    onWeekChange(addDays(weekStart, 7));
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", ...ANIMATION_CONFIG.SPRING }}
      className="w-full"
    >
      <View className="flex-row items-center justify-center mb-4">
        <TouchableOpacity onPress={handlePreviousWeek}>
          <Feather name="chevron-left" size={28} color={COLORS.SECONDARY} />
        </TouchableOpacity>
        <Text
          className="mx-4 text-xl font-lato-bold"
          style={{ color: COLORS.SECONDARY }}
        >
          {weekLabel}
        </Text>
        <TouchableOpacity onPress={handleNextWeek}>
          <Feather name="chevron-right" size={28} color={COLORS.SECONDARY} />
        </TouchableOpacity>
      </View>
    </MotiView>
  );
}
