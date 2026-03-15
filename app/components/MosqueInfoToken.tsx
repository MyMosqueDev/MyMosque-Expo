import Feather from "@expo/vector-icons/Feather";
import { isThisWeek, isToday, isTomorrow, parseISO } from "date-fns";
import { MotiView } from "moti";
import { useCallback, useEffect, useState } from "react";
import { AppState, Platform, Text, View } from "react-native";
import { format } from "../../lib/dateUtils";
import { Event, MosqueInfo, PrayerTime } from "../../lib/types";

interface MosqueInfoTokenProps {
  hours: MosqueInfo["hours"];
  events: Event[] | null;
  nextPrayer: PrayerTime["nextPrayer"] | null;
}

export default function MosqueInfoToken({
  info,
}: {
  info: MosqueInfoTokenProps;
}) {
  const [upcomingEvent, setUpcomingEvent] = useState<Event | null>(null);

  const formatUpcomingEventDate = (isoDateTime: string): string => {
    const date = parseISO(isoDateTime);
    const time = new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    if (isToday(date)) return `Today @ ${time}`;
    if (isTomorrow(date)) return `Tomorrow @ ${time}`;
    if (isThisWeek(date, { weekStartsOn: 1 }))
      return `${format(date, "EEEE")} @ ${time}`;
    return `${format(date, "MMM d")} @ ${time}`;
  };

  const getUpcomingEvent = useCallback((events: Event[]): Event | null => {
    const now = new Date();
    const upcoming = events
      .filter((event) => new Date(event.date) > now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (upcoming.length > 0) {
      upcoming[0].displayDate = formatUpcomingEventDate(upcoming[0].date);
      return upcoming[0];
    }
    return null;
  }, []);

  useEffect(() => {
    setUpcomingEvent(getUpcomingEvent(info.events || []));
  }, [info.events, getUpcomingEvent]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setUpcomingEvent(getUpcomingEvent(info.events || []));
      }
    });
    return () => subscription.remove();
  }, [getUpcomingEvent, info.events]);

  const todayKey = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][new Date().getDay()] as keyof MosqueInfo["hours"];
  const todayHours = info.hours[todayKey];

  const formatMinutes = (mins: number): string => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15, stiffness: 100 }}
      className={`w-full border border-white/30 rounded-2xl p-5 m-2 shadow-md ${
        Platform.OS === "android"
          ? "bg-[#f5f7fa]"
          : "backdrop-blur-lg bg-white/50"
      }`}
    >
      {/* Today's Hours */}
      <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: "timing", duration: 400 }}
        delay={400}
      >
        <View className="flex-col justify-center mb-2">
          <View className="flex-row items-center gap-3">
            <MotiView
              from={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                damping: 10,
                stiffness: 200,
                delay: 700,
              }}
            >
              <Feather name="clock" size={24} color="#4B944B" />
            </MotiView>
            <Text className="text-xl font-bold text-[#4B944B]">Hours</Text>
          </View>
          <Text className="text-base text-[#4B944B] mt-0.5 ml-10">
            {todayHours}
          </Text>
        </View>
      </MotiView>

      {/* Next Prayer */}
      {info.nextPrayer && (
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 400 }}
          delay={200}
        >
          <View className="flex-col justify-center mb-2">
            <View className="flex-row items-center gap-3">
              <MotiView
                from={{ rotate: "0deg" }}
                animate={{ rotate: "360deg" }}
                transition={{ type: "timing", duration: 1000, delay: 500 }}
              >
                <Feather name="sun" size={24} color="#3B5A7A" />
              </MotiView>
              <Text className="text-xl font-bold text-[#3B5A7A]">
                {info.nextPrayer.name.charAt(0).toUpperCase() + info.nextPrayer.name.slice(1)}
              </Text>
            </View>
            <Text className="text-base text-[#3B5A7A] mt-0.5 ml-10">
              Adhan in {formatMinutes(info.nextPrayer.minutesToNextPrayer)}
            </Text>
          </View>
        </MotiView>
      )}

      {/* Upcoming Event */}
      <MotiView
        from={{ opacity: 0, translateX: -20 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ type: "timing", duration: 400 }}
        delay={600}
      >
        <View className="flex-col justify-center">
          <View className="flex-row items-center gap-3">
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: "timing", duration: 500, delay: 900 }}
            >
              <Feather name="moon" size={24} color="#5B4B94" />
            </MotiView>
            <Text className="text-xl font-bold text-[#5B4B94]">
              {upcomingEvent ? upcomingEvent.title : "No upcoming events"}
            </Text>
          </View>
          <Text className="text-base text-[#5B4B94] mt-0.5 ml-10">
            {upcomingEvent
              ? upcomingEvent.displayDate
              : "Enable notifications to stay updated!"}
          </Text>
        </View>
      </MotiView>
    </MotiView>
  );
}
