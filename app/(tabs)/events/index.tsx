import Loading from "@/app/components/Loading";
import EventsList from "./components/EventsList";
import WeekCalendar from "./components/WeekCalendar";
import WeekNavigator from "./components/WeekNavigator";
import ScrollContainer from "@/components/ScrollContainer";
import { useEvents } from "@/lib/hooks/useEvents";
import { useLocalSearchParams } from 'expo-router';
import { View } from "react-native";

/**
 * Events page component
 * 
 * Displays a week view of events with navigation and calendar interface.
 * Events are passed via URL parameters and filtered by the selected week.
 */
export default function Events() {
    const { events: eventsParam } = useLocalSearchParams();
    const { events, weekEvents, isLoading, weekStart, setWeekStart } = useEvents(eventsParam);

    if (isLoading) {
        return <Loading name="Upcoming Events" />;
    }

    return (
        <ScrollContainer name="Upcoming Events">
            <View className="w-full items-center pt-4">
                <WeekNavigator 
                    weekStart={weekStart} 
                    onWeekChange={setWeekStart} 
                />
                
                <WeekCalendar 
                    weekStart={weekStart} 
                    events={events} 
                />
                
                <EventsList events={weekEvents} />
            </View>
        </ScrollContainer>
    );
}
