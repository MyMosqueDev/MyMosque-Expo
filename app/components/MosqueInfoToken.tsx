import Feather from '@expo/vector-icons/Feather';
import { MotiView } from "moti";
import { Text, View } from "react-native";
import { Event, MosqueInfo } from "../../lib/types";
import { format, isThisWeek, isToday, isTomorrow, parseISO } from 'date-fns';

interface GeneralMosqueInfo {
    address: MosqueInfo["address"];
    hours: MosqueInfo["hours"];
    events: Event[] | null;
}

export default function MosqueInfoToken({ info }: { info: GeneralMosqueInfo}) {

    const formatUpcomingEventDate = (isoDateTime: string): string => { // TODO: Move to lib/utils.ts
        const date = parseISO(isoDateTime);
        if (isToday(date)) {
            return `Today @ ${format(date, "h:mm a")}`;
        }
        if (isTomorrow(date)) {
            return `Tomorrow @ ${format(date, "h:mm a")}`;
        }
        if (isThisWeek(date, { weekStartsOn: 1 })) {
            return `${format(date, "EEEE")} @ ${format(date, "h:mm a")}`;
        }
        return `${format(date, "MMM d")} @ ${format(date, "h:mm a")}`;
    }

    const getUpcomingEvent = (events: Event[]): Event | null => {
        const now = new Date();
        const upcoming = events
            .filter(event => {
                const eventDate = new Date(event.date);
                return eventDate > now;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (upcoming.length > 0) {
            upcoming[0].displayDate = formatUpcomingEventDate(upcoming[0].date);
            return upcoming[0];
        }
        return null;
    }

    const upcomingEvent : Event | null = getUpcomingEvent(info.events || []);
    
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className="w-full backdrop-blur-lg border border-white/30 rounded-2xl p-5 m-2 bg-white/50 shadow-md"
        >
            <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 400 }}
                delay={200}
            >
                <View className="flex-col justify-center mb-2">
                    <View className="flex-row items-center gap-3">
                        <MotiView
                            from={{ rotate: '0deg' }}
                            animate={{ rotate: '360deg' }}
                            transition={{ type: 'timing', duration: 1000, delay: 500 }}
                        >
                            <Feather name="map-pin" size={24} color="#3B5A7A" />
                        </MotiView>
                        <Text className="text-xl font-bold text-[#3B5A7A]">{info.address.split(",")[0]}</Text>
                    </View>
                    <Text className="text-base text-[#5A6B7A] mt-0.5 ml-10">{info.address.split(",").slice(1).join(",").trim()}</Text>
                </View>
            </MotiView>

            <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 400 }}
                delay={400}
            >
                <View className="flex-col justify-center mb-2">
                    <View className="flex-row items-center gap-3">
                        <MotiView
                            from={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 700 }}
                        >
                            <Feather name="clock" size={24} color="#4B944B" />
                        </MotiView>
                        <Text className="text-xl font-bold text-[#4B944B]">Hours</Text>
                    </View>
                    <Text className="text-base text-[#4B944B] mt-0.5 ml-10">{info.hours.monday}</Text>
                </View>
            </MotiView>

            <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 400 }}
                delay={600}
            >
                <View className="flex-col justify-center">
                    <View className="flex-row items-center gap-3">
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: 'timing', duration: 500, delay: 900 }}
                        >
                            <Feather name="moon" size={24} color="#5B4B94" />
                        </MotiView>
                        <Text className="text-xl font-bold text-[#5B4B94]">{upcomingEvent ? upcomingEvent.title : "No upcoming events"}</Text>
                    </View>
                    <Text className="text-base text-[#5B4B94] mt-0.5 ml-10">{upcomingEvent ? upcomingEvent.displayDate : "Enable notifications to stay updated!"}</Text>
                </View>
            </MotiView>
        </MotiView>
    )
}