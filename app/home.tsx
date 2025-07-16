import ScrollContainer from "@/components/ScrollContainer";
import getLocationPrayerTimes from "@/lib/getLocationPrayerTimes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Event, MosqueInfo, PrayerTime } from "../lib/types";
import MosqueInfoToken from "./components/MosqueInfoToken";
import PrayerToken from "./components/PrayerToken";

export default function Home() {
    const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo | null>(null);
    const [mosqueEvents, setMosqueEvents] = useState<Event[] | null>(null);
    const [mosquePrayerTimes, setMosquePrayerTimes] = useState<PrayerTime | null>(null);

    function to12HourFormat(time24: string) {
        const [hourStr, minute] = time24.split(':');
        let hour = parseInt(hourStr, 10);
        hour = hour % 12 || 12;
        return `${hour}:${minute}`;
    }

    function addMinutesToTime(time24: string, minutesToAdd: number) {
        const [hourStr, minuteStr] = time24.split(':');
        let hour = parseInt(hourStr, 10);
        let minute = parseInt(minuteStr, 10);

        minute += minutesToAdd;
        hour += Math.floor(minute / 60);
        minute = minute % 60;
        hour = hour % 24;

        const hourFormatted = hour.toString().padStart(2, '0');
        const minuteFormatted = minute.toString().padStart(2, '0');
        return `${hourFormatted}:${minuteFormatted}`;
    }

    
    const fetchMosqueInfo = async () => {
        const userDataString = await AsyncStorage.getItem('userData');

        if (userDataString) {
            const lastVisitedMosqueId = JSON.parse(userDataString).lastVisitedMosque;
            
            const {data: mosqueInfo, error} = await supabase
                .from('mosques')
                .select()
                .eq('id', lastVisitedMosqueId)
                .single();

            const {data: mosqueEvents, error: eventsError} = await supabase
                .from('events')
                .select()
                .eq('masjid_id', lastVisitedMosqueId);

            const today = new Date();
            const year = today.getUTCFullYear();
            const month = String(today.getUTCMonth() + 1).padStart(2, '0');
            const day = String(today.getUTCDate()).padStart(2, '0');
            const todayDbString = `${year}-${month}-${day} 00:00:00+00`;

            const {data: mosquePrayerTimes, error: prayerTimesError} = await supabase
                .from('prayer_times')
                .select()
                .eq('masjid_id', lastVisitedMosqueId)
                .eq('date', todayDbString)
                .single();

            if (error ) {
                console.error('Error fetching mosqueInfo:', error.message);
                return;
            }

            if (eventsError) {
                console.error('Error fetching mosqueEvents:', eventsError.message);
                return;
            }

            if (prayerTimesError) {
                console.error('Error fetching mosquePrayerTimes:', prayerTimesError.message);
                return;
            }

            const city = mosqueInfo.address.split(',')[1].trim();
            try {
                const prayerTimes = await getLocationPrayerTimes(city);
                for (let key in prayerTimes) {
                    const formattedAdhan = to12HourFormat(prayerTimes[key as keyof PrayerTime]);
                    const adhan24 = prayerTimes[key as keyof PrayerTime];
                    const prayerKey = key.toLowerCase() as keyof PrayerTime;

                    if (mosquePrayerTimes.times.prayerTimes[prayerKey]) {
                        mosquePrayerTimes.times.prayerTimes[prayerKey].adhan = formattedAdhan;

                        const iqamaVal = mosquePrayerTimes.times.prayerTimes[prayerKey].iqama;
                        if (typeof iqamaVal === "string" && iqamaVal.startsWith("+")) {
                            const minutesToAdd = parseInt(iqamaVal.slice(1), 10);
                            const iqama24 = addMinutesToTime(adhan24, minutesToAdd);
                            mosquePrayerTimes.times.prayerTimes[prayerKey].iqama = to12HourFormat(iqama24);
                        }
                    }
                }
                console.log(mosquePrayerTimes.times.prayerTimes)
                
            } catch (e) {
                console.error(e);
            }

            setMosqueInfo(mosqueInfo);
            setMosqueEvents(mosqueEvents);
            // TODO - UPDATE DB JSON 
            setMosquePrayerTimes(mosquePrayerTimes.times.prayerTimes);
        }
    }

    

    
    useEffect(() => {
        fetchMosqueInfo();
    }, []);

    if(!mosqueInfo || !mosquePrayerTimes || !mosqueEvents) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>Loading...</Text>
            </View>
        )
    }

    const generalMosqueInfo = {
        address: mosqueInfo.address,
        hours: mosqueInfo.hours,
        events: mosqueEvents
    }

    return (
        <ScrollContainer name={mosqueInfo.name}>
            <View className="flex-1 items-center justify-start">
                {/* Mosque Info Token with entrance animation */}
                <MotiView
                    from={{ opacity: 0, translateY: 50, scale: 0.9 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                    delay={100}
                    className="w-full items-center"
                >
                    <MosqueInfoToken info={generalMosqueInfo} />
                </MotiView>

                {/* Prayer Times Section */}
                <MotiView
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600 }}
                    delay={300}
                    className="w-full items-center"
                >
                    <View className="w-full flex-row justify-between items-end px-2 my-3">
                        <Text className="text-text text-[24px] font-lato-bold">Prayer Times</Text>
                        <Link href="/prayer">
                            <Text className="text-md text-[#5B4B94] font-lato-bold">View More</Text>
                        </Link>
                    </View>
                    <PrayerToken prayerTimes={mosquePrayerTimes} />
                </MotiView>

                {/* Announcements Section */}
                {/* <MotiView
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600 }}
                    delay={500}
                    className="w-full"
                >
                    <View className="w-full flex-row justify-between items-end px-2 mt-3">
                        <Text className="text-text text-[24px] font-lato-bold">Announcements</Text>
                        <Link 
                            href={{
                                pathname: "/announcements",
                                params: {
                                    announcements: JSON.stringify(mosqueData.announcements)
                                }
                            }}
                        >
                            <Text className="text-md text-[#4B944B] font-lato-bold">View More</Text>
                        </Link>
                    </View>
                    <AnnouncementsCarousel announcements={mosqueData.announcements} />
                </MotiView> */}

                {/* Events Section */}
                {/* <MotiView
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600 }}
                    delay={700}
                    className="w-full"
                >
                    <View className="w-full flex-row justify-between items-end px-2 my-3">
                        <Text className="text-text text-[24px] font-lato-bold">Upcoming Events</Text>
                        <Link href="/events">
                            <Text className="text-md text-[#3B5A7A] font-lato-bold">View More</Text>
                        </Link>
                    </View>
                    {mosqueData.events.slice(0, 2).map((event, index) => (
                        <MotiView
                            key={event.title}
                            from={{ opacity: 0, translateX: -50 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ 
                                type: 'spring', 
                                damping: 15, 
                                stiffness: 100,
                                delay: 800 + (index * 150)
                            }}
                            className="w-full items-center"
                        >
                            <EventToken event={{ ...event, mosqueName: mosqueData.name }} />
                        </MotiView>
                    ))}
                </MotiView> */}
            </View>
        </ScrollContainer>
    )
}