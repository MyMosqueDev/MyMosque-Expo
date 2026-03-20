import Loading from "@/app/components/Loading";
import EventsList from "./components/EventsList";
import WeekCalendar from "./components/WeekCalendar";
import WeekNavigator from "./components/WeekNavigator";
import ScrollContainer from "@/components/ScrollContainer";
import { useEvents } from "@/lib/hooks/useEvents";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { addDays } from "date-fns";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { useCallback } from "react";

export default function Events() {
  const { events: eventsParam } = useLocalSearchParams();
  const { events, weekEvents, isLoading, weekStart, setWeekStart } =
    useEvents(eventsParam);

  const goBack = useCallback(
    () => setWeekStart(addDays(weekStart, -7)),
    [weekStart, setWeekStart],
  );
  const goForward = useCallback(
    () => setWeekStart(addDays(weekStart, 7)),
    [weekStart, setWeekStart],
  );

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .onEnd((e) => {
      if (e.translationX > 50) {
        goBack();
      } else if (e.translationX < -50) {
        goForward();
      }
    })
    .runOnJS(true);

  if (isLoading) {
    return <Loading name="Upcoming Events" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={swipeGesture}>
        <ScrollContainer name="Upcoming Events">
          <View className="w-full items-center pt-4">
            <WeekNavigator weekStart={weekStart} onWeekChange={setWeekStart} />
            <WeekCalendar weekStart={weekStart} events={events} />
            <EventsList events={weekEvents} />
          </View>
        </ScrollContainer>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
