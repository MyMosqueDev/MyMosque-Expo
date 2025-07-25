import { useState } from "react";
import { Dimensions, FlatList, View } from "react-native";
import { Announcement } from "../../lib/types";
import AnnouncementToken from "./AnnouncementToken";

// sets all dimensions
const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 1;
const CARD_SPACING = 7;

// props for the announcements carousel
interface AnnouncementsCarouselProps {
    announcements: Announcement[];
}

export default function AnnouncementsCarousel({ announcements }: AnnouncementsCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // curr announcement
    const renderAnnouncement = ({ item }: { item: Announcement }) => (
        <View style={{ width: CARD_WIDTH, marginHorizontal: CARD_SPACING / 2 }}>
            <AnnouncementToken announcement={item} />
        </View>
    );

    const handleScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / (CARD_WIDTH + CARD_SPACING));
        setCurrentIndex(index);
    };

    return (
        <View className="w-full">
            
            <FlatList
                data={announcements}
                renderItem={renderAnnouncement}
                keyExtractor={(item) => item.title}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + CARD_SPACING}
                decelerationRate="fast"
                contentContainerStyle={{ 
                    paddingHorizontal: (screenWidth - CARD_WIDTH) / 2,
                    paddingVertical: 12
                }}
                className="w-full"
                onScroll={handleScroll}
                scrollEventThrottle={16}
            />

            {/* page dots */}
            <View className="flex-row justify-center items-center">
                {announcements.map((_, index) => (
                    <View
                        key={index}
                        className={`mx-1 rounded-full ${
                            index === currentIndex 
                                ? 'bg-white/90 w-2 h-2' 
                                : 'bg-white/45 w-2 h-2'
                        }`}
                    />
                ))}
            </View>
        </View>
    );
} 