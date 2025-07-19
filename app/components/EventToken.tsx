import Feather from '@expo/vector-icons/Feather';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from "react-native";
import { formatUTC, parseISOUTC } from "../../lib/dateUtils";
import { Event } from "../../lib/types";


export default function EventToken({ event }: { event: Event }) {
    const day = formatUTC(parseISOUTC(event.date), 'EEEE, MMMM d')
    const time = formatUTC(parseISOUTC(event.date), 'h:mm a')
    
    return (
        <TouchableOpacity 
            onPress={() => router.push({
                pathname: "../eventDetails",
                params: {
                    eventData: JSON.stringify(event)
                }
            })}
            className="w-full backdrop-blur-lg border border-white/30 rounded-2xl p-5 m-1 bg-white/50 shadow-md"
        >
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-2xl font-lato-bold text-text">{event.title}</Text>
                <Feather name="arrow-right" size={24} color="black" />
            </View>
            <View className="flex-row items-center mb-2">
                <Feather name="calendar" size={20} color="#4A4A4A" />
                <Text className="ml-2 text-base text-text">{day}</Text>
            </View>
            <View className="flex-row items-center mb-2">
                <Feather name="clock" size={20} color="#4A4A4A" />
                <Text className="ml-2 text-base text-text">{time}</Text>
            </View>
            <View className="flex-row items-center">
                <Feather name="map-pin" size={20} color="#4A4A4A" />
                <Text className="ml-2 text-base text-text">{event.location}</Text>
            </View>
        </TouchableOpacity>
    )
}