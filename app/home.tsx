import ScrollContainer from "@/components/ScrollContainer";
import { MotiView } from "moti";
import { Text, View } from "react-native";
import { MosqueData } from "../lib/types";
import AnnouncementsCarousel from "./components/AnnouncementsCarousel";
import EventToken from "./components/EventToken";
import MosqueInfoToken from "./components/MosqueInfoToken";
import PrayerToken from "./components/PrayerToken";

export default function Home({ data }: { data: MosqueData }) {
    const generalMosqueInfo = {
        address: data.address,
        hours: data.hours,
        events: data.events
    }

    return (
        <ScrollContainer name={data.name}>
            <View className="flex-1 items-center justify-start">
                {/* Mosque Info Token with entrance animation */}
                <MotiView
                    from={{ opacity: 0, translateY: 50, scale: 0.9 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                    delay={100}
                    className="w-full"
                >
                    <MosqueInfoToken info={generalMosqueInfo} />
                </MotiView>

                {/* Prayer Times Section */}
                <MotiView
                    from={{ opacity: 0, translateY: 30 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600 }}
                    delay={300}
                    className="w-full"
                >
                    <View className="w-full flex-row justify-between items-end px-2 my-3">
                        <Text className="text-text text-[24px] font-lato-bold">Prayer Times</Text>
                        <Text className="text-md text-[#5B4B94] font-lato-bold">View More</Text>
                    </View>
                    <PrayerToken prayerTimes={data.prayerTimes} />
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
                        <Text className="text-md text-[#4B944B] font-lato-bold">View More</Text>
                    </View>
                    <AnnouncementsCarousel announcements={data.announcements} />
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
                        <Text className="text-md text-[#3B5A7A] font-lato-bold">View More</Text>
                    </View>
                    {data.events.map((event, index) => (
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
                        >
                            <EventToken event={event} />
                        </MotiView>
                    ))}
                </MotiView>
            </View>
        </ScrollContainer>
    )
}