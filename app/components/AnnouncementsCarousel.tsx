import { useState } from "react";
import { Dimensions, FlatList, Text, View } from "react-native";
import { MosqueData } from "../../lib/types";
import AnnouncementToken from "./AnnouncementToken";

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 1;
const CARD_SPACING = 7;

interface AnnouncementsCarouselProps {
    announcements: MosqueData["announcements"];
}

export default function AnnouncementsCarousel({ announcements }: AnnouncementsCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const renderAnnouncement = ({ item }: { item: MosqueData["announcements"][0] }) => (
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

            {/* Pagination Dots */}
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