import ScrollContainer from "@/components/ScrollContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { MosqueData } from "../lib/types";
import AnnouncementsCarousel from "./components/AnnouncementsCarousel";
import EventToken from "./components/EventToken";
import MosqueInfoToken from "./components/MosqueInfoToken";
import PrayerToken from "./components/PrayerToken";

export default function Home({ data }: { data: MosqueData }) {
    const [mosqueData, setMosqueData] = useState<MosqueData | null>(data);
    useEffect(() => {
        const fetchData = async () => {
        if (!data) {
            const userDataString = await AsyncStorage.getItem('userData');
            if (userDataString) {
                const parsedUserData = JSON.parse(userDataString);
                setMosqueData(parsedUserData.lastVisitedMosque);
                } 
            }
        }
        fetchData();
    }, [data]);

    if(!mosqueData) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text>Loading...</Text>
            </View>
        )
    }

    const generalMosqueInfo = {
        address: mosqueData.address,
        hours: mosqueData.hours,
        events: mosqueData.events
    }

    return (
        <ScrollContainer name={mosqueData.name}>
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
                        <Link href="/prayers">
                            <Text className="text-md text-[#5B4B94] font-lato-bold">View More</Text>
                        </Link>
                    </View>
                    <PrayerToken prayerTimes={mosqueData.prayerTimes} />
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
                                    announcements: JSON.stringify(mosqueData.announcements)
                                }
                            }}
                        >
                            <Text className="text-md text-[#4B944B] font-lato-bold">View More</Text>
                        </Link>
                    </View>
                    <AnnouncementsCarousel announcements={mosqueData.announcements} />
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
                </MotiView>
            </View>
        </ScrollContainer>
    )
}