import ScrollContainer from "@/components/ScrollContainer";
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
                <MosqueInfoToken info={generalMosqueInfo} />

                <View className="w-full flex-row justify-between items-end px-2 my-3">
                    <Text className="text-text text-[24px] font-lato-bold">Prayer Times</Text>
                    <Text className="text-md text-[#5B4B94] font-lato-bold">View More</Text>
                </View>
                <PrayerToken prayerTimes={data.prayerTimes} />
                <View className="w-full flex-row justify-between items-end px-2 mt-3">
                    <Text className="text-text text-[24px] font-lato-bold">Announcements</Text>
                    <Text className="text-md text-[#4B944B] font-lato-bold">View More</Text>
                </View>
                <AnnouncementsCarousel announcements={data.announcements} />

                <View className="w-full flex-row justify-between items-end px-2 my-3">
                    <Text className="text-text text-[24px] font-lato-bold">Upcoming Events</Text>
                    <Text className="text-md text-[#3B5A7A] font-lato-bold">View More</Text>
                </View>
                {data.events.map((event) => (
                    <EventToken event={event} key={event.title}/>
                ))}
            </View>
        </ScrollContainer>
    )
}