import { EventData } from "@/lib/types";
import { useLocalSearchParams } from "expo-router";
import { View, Text, ImageBackground, ScrollView } from "react-native";

export default function Event() {
    const params = useLocalSearchParams();
    const eventData: EventData = JSON.parse(params.eventData as string)

    return (
        <ImageBackground 
            source={require('../../assets/background.png')}
            style={{ flex: 1 }}
            resizeMode="cover"
        >
            <ScrollView 
                className={'flex flex-1 px-4 pt-1'}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ 
                    paddingBottom: 90,
                    flexGrow: 1,
                }}
            >
                
            </ScrollView>
        </ImageBackground>
    )
    
    
}
