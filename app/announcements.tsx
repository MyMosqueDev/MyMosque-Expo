import ScrollContainer from "@/components/ScrollContainer";
import { MosqueData } from "@/lib/types";
import { useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import AnnouncementToken from "./components/AnnouncementToken";

export default function Announcements() {
    const { announcements } = useLocalSearchParams();
    const parsedAnnouncements = JSON.parse(announcements as string);
    
    return (
        <ScrollContainer name="Announcements">
            <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                className="flex-1 w-full px-2 pt-6 gap-3"
            >
                {parsedAnnouncements.map((announcement: MosqueData["announcements"][0], index: number) => (
                    <MotiView
                        key={index}
                        from={{ opacity: 0, translateX: -20, scale: 0.95 }}
                        animate={{ opacity: 1, translateX: 0, scale: 1 }}
                        transition={{ 
                            type: 'spring', 
                            damping: 15, 
                            stiffness: 150,
                            delay: 100 + (index * 100)
                        }}
                    >
                        <AnnouncementToken announcement={announcement} />
                    </MotiView>
                ))}
            </MotiView>
        </ScrollContainer>
    )
}