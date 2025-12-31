import { useMosqueData } from "@/app/_layout";
import ScrollContainer from "@/components/ScrollContainer";
import useNotifications from "@/lib/hooks/useNotifications";
import { getNextPrayer } from "@/lib/prayerTimeUtils";
import { Link } from "expo-router";
import { MotiView } from "moti";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { ProcessedMosqueData } from "../lib/types";
import AnnouncementsCarousel from "./components/AnnouncementsCarousel";
import EmptyToken from "./components/EmptyToken";
import ErrorScreen from "./components/ErrorScreen";
import EventToken from "./components/EventToken";
import MosqueInfoToken from "./components/MosqueInfoToken";
import PrayerToken from "./components/PrayerToken";

export default function Home() {
  const { mosqueData }: { mosqueData: ProcessedMosqueData | null } =
    useMosqueData();

  useNotifications();

  const displayedEvents = useMemo(() => {
    if (!mosqueData) return [];
    return mosqueData.events.filter((e) => new Date(e.date) > new Date());
  }, [mosqueData]);

  const displayedAnnouncements = useMemo(() => {
    if (!mosqueData) return [];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return mosqueData.announcements.filter(
      (a) => new Date(a.created_at) > oneWeekAgo,
    );
  }, [mosqueData]);

  const updatedPrayerTimes = useMemo(() => {
    if (!mosqueData) return null;
    return {
      ...mosqueData.prayerTimes,
      nextPrayer: getNextPrayer(mosqueData.prayerTimes),
    };
  }, [mosqueData]);

  if (!mosqueData) {
    return <ErrorScreen error="No mosque data found" />;
  }

  const generalMosqueInfo = {
    address: mosqueData.info.address,
    hours: mosqueData.info.hours,
    events: displayedEvents,
  };

  return (
    <ScrollContainer name={mosqueData.info.name}>
      <View className="flex-1 items-center justify-start">
        {/* Mosque Info Token */}
        <MotiView
          from={{ opacity: 0, translateY: 50, scale: 0.9 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          delay={100}
          className="w-full items-center"
        >
          <MosqueInfoToken info={generalMosqueInfo} />
        </MotiView>

        {/* Prayer Times Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          delay={300}
          className="w-full items-center"
        >
          <View className="w-full flex-row justify-between items-end px-2 my-3">
            <Text className="text-text text-[24px] font-lato-bold">
              Prayer Times
            </Text>
            <Link
              href={{
                pathname: "/prayer",
                params: {
                  prayerTimes: JSON.stringify(updatedPrayerTimes),
                },
              }}
            >
              <Text className="text-md text-[#5B4B94] font-lato-bold">
                View More
              </Text>
            </Link>
          </View>
          <PrayerToken prayerTimes={updatedPrayerTimes!} />
        </MotiView>

        {/* Announcements Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          delay={500}
          className="w-full"
        >
          <View className="w-full flex-row justify-between items-end px-2 mt-3">
            <Text className="text-text text-[24px] font-lato-bold">
              Announcements
            </Text>
            <Link
              href={{
                pathname: "/announcements",
                params: {
                  announcements: JSON.stringify(mosqueData.announcements),
                },
              }}
            >
              <Text className="text-md text-[#4B944B] font-lato-bold">
                View More
              </Text>
            </Link>
          </View>
          <AnnouncementsCarousel announcements={displayedAnnouncements} />
        </MotiView>

        {/* Events Section */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 600 }}
          delay={700}
          className="w-full"
        >
          <View className="w-full flex-row justify-between items-end px-2 my-3">
            <Text className="text-text text-[24px] font-lato-bold">
              Upcoming Events
            </Text>
            <Link
              href={{
                pathname: "/events",
                params: {
                  events: JSON.stringify(mosqueData.events),
                },
              }}
            >
              <Text className="text-md text-[#3B5A7A] font-lato-bold">
                View More
              </Text>
            </Link>
          </View>
          {displayedEvents.map((event, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateX: -50 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 100,
                delay: 800 + index * 150,
              }}
              className="w-full items-center"
            >
              <EventToken
                event={{ ...event, mosqueName: mosqueData.info.name }}
              />
            </MotiView>
          ))}
          {displayedEvents.length === 0 && <EmptyToken type="events" />}
        </MotiView>
      </View>
    </ScrollContainer>
  );
}
