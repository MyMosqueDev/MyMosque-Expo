import { useMosqueData } from "@/app/_layout";
import ScrollContainer from "@/components/ScrollContainer";
import { getNextPrayer } from "@/lib/prayerTimeUtils";
import { fetchMosqueInfo } from "@/lib/utils";
import { Link } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Text, View } from "react-native";
import { Announcement, Event, MosqueInfo, PrayerTime, ProcessedMosqueData } from "../lib/types";
import AnnouncementsCarousel from "./components/AnnouncementsCarousel";
import EmptyToken from "./components/EmptyToken";
import EventToken from "./components/EventToken";
import MosqueInfoToken from "./components/MosqueInfoToken";
import PrayerToken from "./components/PrayerToken";

export default function Home() {
    const { mosqueData } = useMosqueData();
    const announcements =  mosqueData?.announcements
        .filter((announcement) => (announcement.status !== 'deleted' && announcement.status !== 'draft'))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || null;
    const events = mosqueData?.events
        .filter((event) => (event.status !== 'deleted' && event.status !== 'draft'))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || null;
    const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo | null>(mosqueData?.info || null);
    const [mosqueEvents, setMosqueEvents] = useState<Event[] | null>(events);
    const [mosquePrayerTimes, setMosquePrayerTimes] = useState<PrayerTime | null>(mosqueData?.prayerInfo.prayerTimes || null);
    const [mosqueAnnouncements, setMosqueAnnouncements] = useState<Announcement[] | null>(announcements);    
    
    // gets updated prayer times
    const getUpdatedPrayerTimes = () => {
        if(mosquePrayerTimes) {
            const updatedPrayerTimes = getNextPrayer(mosquePrayerTimes);
            return {
                ...mosquePrayerTimes,
                nextPrayer: updatedPrayerTimes
            }
        }
        return mosquePrayerTimes;
    }

    const setMosqueData = (mosqueData: ProcessedMosqueData) => {
        setMosqueInfo(mosqueData.info);
        setMosqueEvents(mosqueData.events.filter((event) => (event.status !== 'deleted' && event.status !== 'draft')));
        setMosquePrayerTimes(mosqueData?.prayerInfo.prayerTimes);
        const announcements = mosqueData.announcements
            .filter((announcement) => (announcement.status !== 'deleted' && announcement.status !== 'draft'))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setMosqueAnnouncements(announcements);
    }
    
    // fetches mosque data if it doesn't exist
    useEffect(() => {
        if (!mosqueData) {
            const fetchData = async () => {
                const mosqueData = await fetchMosqueInfo();
                if (mosqueData) {
                    setMosqueData(mosqueData);
                }
            }
            fetchData();
        }
    }, [mosqueData]);

    // refreshes data when app is brought back to life
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                if (mosqueData) {
                    setMosqueData(mosqueData);
                }
            }
        });
        
        return () => {
            subscription.remove();
        };
    }, [mosqueData])


    if(!mosqueInfo || !mosquePrayerTimes || !mosqueEvents || !mosqueAnnouncements) {
        return (
            <ScrollContainer name={mosqueInfo?.name || ''}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#5B4B94" />
                    <Text className="text-text mt-4 font-lato-regular">Loading mosque information...</Text>
                </View>
            </ScrollContainer>
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
                        <Link 
                            href={{
                                pathname: "/prayer",
                                params: {
                                    prayerTimes: mosquePrayerTimes ? JSON.stringify(getUpdatedPrayerTimes()) : '{}'
                                }
                            }}
                        >
                            <Text className="text-md text-[#5B4B94] font-lato-bold">View More</Text>
                        </Link>
                    </View>
                    <PrayerToken prayerTimes={getUpdatedPrayerTimes() || mosquePrayerTimes} />
                </MotiView>

                {/* Announcements Section */}
                <MotiView
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
                                    announcements: JSON.stringify(mosqueAnnouncements)
                                }
                            }}
                        >
                            <Text className="text-md text-[#4B944B] font-lato-bold">View More</Text>
                        </Link>
                    </View>
                    {mosqueAnnouncements.length === 0 && <EmptyToken type="announcements" />}
                    <AnnouncementsCarousel announcements={mosqueAnnouncements} />
                </MotiView>

                {/* Events Section */}
                <MotiView
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600 }}
                    delay={700}
                    className="w-full"
                >
                    <View className="w-full flex-row justify-between items-end px-2 my-3">
                        <Text className="text-text text-[24px] font-lato-bold">Upcoming Events</Text>
                        <Link 
                            href={{
                                pathname: "/events",
                                params: {
                                    events: mosqueEvents ? JSON.stringify(mosqueEvents.filter((event) => (event.status !== 'deleted' && event.status !== 'draft'))) : '[]'
                                }
                            }}
                        >
                            <Text className="text-md text-[#3B5A7A] font-lato-bold">View More</Text>
                        </Link>
                    </View>
                    {mosqueEvents
                        .filter((event) => (event.status !== 'deleted' && event.status !== 'draft'))
                        .filter(event => new Date(event.date) > new Date())
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .slice(0, 2)
                        .map((event, index) => (
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
                            <EventToken event={{ ...event, mosqueName: mosqueInfo.name }} />
                        </MotiView>
                    ))}
                    {mosqueEvents.length === 0 && <EmptyToken type="events" />}
                </MotiView>
            </View>
        </ScrollContainer>
    )
}