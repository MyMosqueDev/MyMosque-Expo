import ScrollContainer from "@/components/ScrollContainer";
import { Feather } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addDays, endOfWeek, format, isSameDay, isWithinInterval, parseISO, startOfWeek } from 'date-fns';
import { MotiView } from 'moti';
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { EventData, MosqueData } from "../lib/types";
import EventToken from "./components/EventToken";

const DAY_LABELS = ["S", "M", "T", "W", "Th", "F", "S"];

export default function Events() {
    const [mosqueData, setMosqueData] = useState<MosqueData | null>(null);
    const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 0 }));
    const [events, setEvents] = useState<EventData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMosqueData = async () => {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
                const parsedUserData = JSON.parse(userDataString);
                setMosqueData(parsedUserData.lastVisitedMosque);
                setEvents(parsedUserData.lastVisitedMosque?.events || []);
            }
            setIsLoading(false);
        };
        fetchMosqueData();
    }, []);

    // Calculate week range
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Filter events for this week
    const weekEvents = events
        .filter(event => {
            // console.log(event);
            // console.log(event.isoDateTime);
            const eventDate = parseISO(event.isoDateTime);
            return isWithinInterval(eventDate, { start: weekStart, end: weekEnd });
        })
        .sort((a, b) => parseISO(a.isoDateTime).getTime() - parseISO(b.isoDateTime).getTime());

    // Helper: does a day have an event?
    const dayHasEvent = (date: Date) => {
        return events.some(event => isSameDay(parseISO(event.isoDateTime), date));
    };

    // Week range label
    const weekLabel = `${format(weekStart, 'MMMM do')} - ${format(weekEnd, 'do')}`;

    if (isLoading) {
        return (
            <ScrollContainer name="Upcoming Events">
                <View className="flex-1 items-center justify-center">
                    <Text>Loading...</Text>
                </View>
            </ScrollContainer>
        );
    }

    return (
        <ScrollContainer name="Upcoming Events">
            <View className="w-full items-center pt-4">
                {/* Week Slider Animation */}
                <MotiView
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 120 }}
                    className="w-full"
                >
                    <View className="flex-row items-center justify-center mb-4">
                        <TouchableOpacity onPress={() => setWeekStart(addDays(weekStart, -7))}>
                            <Feather name="chevron-left" size={28} color="#4A4A4A" />
                        </TouchableOpacity>
                        <Text className="mx-4 text-xl font-lato-bold text-[#4A4A4A]">{weekLabel}</Text>
                        <TouchableOpacity onPress={() => setWeekStart(addDays(weekStart, 7))}>
                            <Feather name="chevron-right" size={28} color="#4A4A4A" />
                        </TouchableOpacity>
                    </View>
                </MotiView>
                {/* Days Row Animation */}
                <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 500, delay: 100 }}
                    className="w-full"
                >
                    <View className="flex-row justify-between w-full px-4 mb-4">
                        {weekDates.map((date, idx) => (
                            <View key={idx} className="items-center flex-1">
                                <Text className="text-xs font-lato-bold text-[#4A4A4A] mb-1">{DAY_LABELS[idx]}</Text>
                                <View
                                    className="rounded-full w-9 h-9 items-center justify-center"
                                >
                                    <Text className={`text-lg font-lato-bold ${dayHasEvent(date) ? 'text-[#88AE79]' : 'text-[#4A4A4A]'}`}>{date.getDate()}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </MotiView>
                {/* Events List Animation */}
                <ScrollView className="w-full" contentContainerStyle={{ paddingBottom: 30 }} style={{ overflow: 'visible' }}>
                    {weekEvents.length === 0 && (
                        <MotiView
                            from={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 150, delay: 200 }}
                        >
                            <Text className="text-center text-[#4A4A4A] mt-8">No events this week.</Text>
                        </MotiView>
                    )}
                    {weekEvents.map((event, idx) => (
                        <MotiView
                            key={event.title + event.isoDateTime + idx}
                            from={{ opacity: 0, translateX: -20, scale: 0.95 }}
                            animate={{ opacity: 1, translateX: 0, scale: 1 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 150, delay: 100 + idx * 100 }}
                            style={{ overflow: 'visible' }}
                        >
                            <EventToken event={{ ...event, mosqueName: mosqueData?.name || '' }} />
                        </MotiView>
                    ))}
                </ScrollView>
            </View>
        </ScrollContainer>
    );
}
