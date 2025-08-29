import { Event } from "@/lib/types";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { parseISO } from 'date-fns';
import { useLocalSearchParams } from "expo-router";
import { MotiView } from "moti";
import { Image, ImageBackground, ScrollView, Text, View } from "react-native";
import { format } from "../../lib/dateUtils";
import { ANIMATION_CONFIG } from "@/lib/constants";

export default function EventDetails() {
    const params = useLocalSearchParams();
    const eventData: Event = JSON.parse(params.eventData as string)
    const date = format(parseISO(eventData.date), 'EEEE, MMMM do')
    const time = format(parseISO(eventData.date), 'h:mm a')

    return (
        <ImageBackground 
            source={require('../../assets/background.png')}
            style={{ flex: 1 }}
            resizeMode="cover"
        >
            <ScrollView 
                className={'flex flex-1 px-6 pt-1'}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ 
                    paddingBottom: 90,
                    flexGrow: 1,
                }}
            >
                {/* Event Image with entrance animation */}
                <MotiView
                    from={{ opacity: 0, scale: 0.9, translateY: 20 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{ type: 'spring', ...ANIMATION_CONFIG.SPRING_STIFF, }}
                    delay={50}
                >
                    <Image 
                        source={{ uri: eventData.image }} 
                        className="w-full aspect-square mb-4"
                        resizeMode="cover"
                    />
                </MotiView>

                <View className="flex w-full px-1 gap-6">
                    {/* Header Section with staggered animations */}
                    <MotiView
                        from={{ opacity: 0, translateY: 30 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'spring', ...ANIMATION_CONFIG.SPRING_STIFF }}
                        delay={150}
                        className="flex-col"
                    >
                        <View className="flex-row justify-between items-center gap-2">
                            <MotiView
                                from={{ opacity: 0, translateX: -20 }}
                                animate={{ opacity: 1, translateX: 0 }}
                                transition={{ type: 'spring', ...ANIMATION_CONFIG.SPRING_STIFF }}
                                delay={200}
                            >
                                <Text className="text-text text-2xl font-lato-bold">{date}</Text>
                            </MotiView>
                        </View>
                        <MotiView
                            from={{ opacity: 0, translateY: 10 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'spring', ...ANIMATION_CONFIG.SPRING_STIFF }}
                            delay={300}
                        >
                            <Text className="text-[#666666] text-lg font-lato-bold">{time}</Text>
                        </MotiView>
                    </MotiView>

                    {/* Mosque Info Section with staggered animations */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'spring', ...ANIMATION_CONFIG.SPRING_STIFF }}
                        delay={350}
                        className="flex-col gap-2"
                    >
                        <MotiView
                            from={{ opacity: 0, translateX: -15 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ type: 'spring', ...ANIMATION_CONFIG.SPRING_STIFF }}
                            delay={400}
                        >
                            <View className="flex-row items-center gap-2">
                                <MaterialIcons name="people-alt" size={18} color="#4A4A4A" />
                                <Text className="text-text text-xl font-lato">Hosted by <Text className="font-lato-bold">{eventData.host}</Text></Text>
                            </View>
                        </MotiView>
                        <MotiView
                            from={{ opacity: 0, translateX: -15 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ type: 'spring', ...ANIMATION_CONFIG.SPRING_STIFF }}
                            delay={450}
                        >
                            <View className="flex-row items-center gap-2">
                                <Feather name="map-pin" size={18} color="#4A4A4A" />
                                <Text className="text-text text-xl font-lato">Located @ <Text className="font-lato-bold">{eventData.location}</Text></Text>
                            </View>
                        </MotiView>
                    </MotiView>

                    {/* Description with entrance animation */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20, scale: 0.95 }}
                        animate={{ opacity: 1, translateY: 0, scale: 1 }}
                        transition={{ type: 'spring', ...ANIMATION_CONFIG.SPRING_STIFF }}
                        delay={500}
                    >
                        <Text className="text-text text-xl font-lato-bold">
                            {eventData.description}
                        </Text>
                    </MotiView>

                </View>
                
            </ScrollView>
        </ImageBackground>
    )
    
    
}
