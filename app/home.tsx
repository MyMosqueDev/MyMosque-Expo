import { useMosqueData } from "@/app/_layout";
import ScrollContainer from "@/components/ScrollContainer";
import { getNextPrayer } from "@/lib/getPrayerTimes";
import { fetchMosqueInfo } from "@/lib/utils";
import { Link } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Text, View } from "react-native";
import { Announcement, Event, MosqueInfo, PrayerTime } from "../lib/types";
import AnnouncementsCarousel from "./components/AnnouncementsCarousel";
import EventToken from "./components/EventToken";
import MosqueInfoToken from "./components/MosqueInfoToken";
import PrayerToken from "./components/PrayerToken";

export default function Home() {
    const { mosqueData } = useMosqueData();
    const [mosqueInfo, setMosqueInfo] = useState<MosqueInfo | null>(null);
    const [mosqueEvents, setMosqueEvents] = useState<Event[] | null>(null);
    const [mosquePrayerTimes, setMosquePrayerTimes] = useState<PrayerTime | null>(null);
    const [mosqueAnnouncements, setMosqueAnnouncements] = useState<Announcement[] | null>(null);    
    console.log(mosqueData?.events)
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
    
    useEffect(() => {
        if (mosqueData) {
            setMosqueInfo(mosqueData.info);
            setMosqueEvents(mosqueData.events);
            setMosqueAnnouncements(mosqueData.announcements);
            setMosquePrayerTimes(mosqueData.prayerTimes);
        } else {
            const fetchData = async () => {
                const mosqueData = await fetchMosqueInfo();
                if(mosqueData) {
                    setMosqueInfo(mosqueData.info);
                    setMosqueEvents(mosqueData.events);
                    setMosquePrayerTimes(mosqueData.prayerTimes);
                    setMosqueAnnouncements(mosqueData.announcements);
                }
            }
            fetchData();
        }
    }, [mosqueData]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                if(mosqueData) {
                    setMosqueInfo(mosqueData.info);
                    setMosqueEvents(mosqueData.events);
                    setMosqueAnnouncements(mosqueData.announcements);
                    setMosquePrayerTimes(mosqueData.prayerTimes);
                }
            }
        });
        
        return () => {
            subscription.remove();
        };
    }, [])

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
                                    events: mosqueEvents ? JSON.stringify(mosqueEvents) : '[]'
                                }
                            }}
                        >
                            <Text className="text-md text-[#3B5A7A] font-lato-bold">View More</Text>
                        </Link>
                    </View>
                    {mosqueEvents
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
                </MotiView>
            </View>
        </ScrollContainer>
    )
}