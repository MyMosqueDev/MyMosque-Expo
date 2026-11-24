import { useMosqueData } from "@/app/_layout";
import Header from "@/components/Header";
import { Announcement } from "@/lib/types";
import { MotiView } from "moti";
import { ImageBackground, ScrollView } from "react-native";
import AnnouncementToken from "../components/AnnouncementToken";

/**
 * Announcements page component
 *
 * Displays a list of announcements.
 */
export default function Announcements() {
  const { mosqueData } = useMosqueData();
  const announcements = mosqueData?.announcements ?? [];

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Header Section*/}
      <Header name="" type="event" title="Announcements" />
      <ScrollView
        className={"flex flex-1 px-6 pt-1"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 90,
          flexGrow: 1,
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 150 }}
          className="flex-1 w-full px-2 gap-1 justify-start items-center"
        >
          {/* displays all announcements */}
          {announcements.map((announcement: Announcement, index: number) => (
            <MotiView
              key={announcement.id}
              from={{ opacity: 0, translateX: -20, scale: 0.95 }}
              animate={{ opacity: 1, translateX: 0, scale: 1 }}
              transition={{
                type: "spring",
                damping: 15,
                stiffness: 150,
                delay: 100 + index * 100,
              }}
            >
              <AnnouncementToken announcement={announcement} />
            </MotiView>
          ))}
        </MotiView>
      </ScrollView>
    </ImageBackground>
  );
}
