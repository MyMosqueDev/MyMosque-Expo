import { useMosqueData } from "@/app/_layout";
import { getPushToken } from '@/lib/getPushToken';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { Text, TouchableOpacity, View } from "react-native";

export default function Header({ name, type, title }: { name: string, type: string, title: string | null }) {
    const { mosqueData } = useMosqueData();
    name = mosqueData?.info.name || name;
    type = type || 'default'

    // used in tab based pages
    if (type === 'default') {
        return (
            <View className="w-full flex-row justify-between items-center px-4 pb-3 pt-24 pr-6">
                <Text className="text-text text-3xl font-lato-bold">{name.length > 23 ? name.substring(0, 23) + '...' : name}</Text>
                <View className="flex-row items-center gap-3">
                    <Link 
                        href={{pathname: "/settings"}}
                    >
                        <MaterialCommunityIcons name="cog" size={24} color="#4A4A4A" />
                    </Link>
                    <TouchableOpacity onPress={() => router.replace('/map')}>
                        <MaterialCommunityIcons name="swap-horizontal" size={30} color="#4A4A4A" />
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const onBack = async () => {
        router.back();
        if (type === 'settings') {
            const settings = await AsyncStorage.getItem('appSettings');
            const mosqueId = mosqueData?.info.uid;
            const token = await getPushToken();
            const url = 'https://www.mymosque.app/api/pushToken';

            async function updatePushToken() {
                console.log(token);
                console.log(mosqueId);
                console.log(settings);
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            pushToken: token,
                            mosqueId: mosqueId,
                            settings: settings
                        })
                    });
                    
                    const data = await response.json();
                    console.log('Response with options:', data);
                    return data;
                } catch (error) {
                    console.error('Error:', error);
                }
            }
            await updatePushToken();
        }
    }

    // used in annoucnments, events, and notifications
    if (type === 'event' || type === 'settings') {
        return (
            <View className="w-full flex-row justify-between items-center px-4 pb-3 pt-24 ">
                <TouchableOpacity onPress={onBack}>
                    <Feather name="arrow-left" size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <View className="flex-col items-center">
                    <Text className="text-text text-3xl font-lato-bold">{title}</Text>
                    {type !== 'settings' && (
                        <Text className="text-text text-sm font-lato-bold">{name}</Text>
                    )}
                </View>
                <View className="w-[24px]"/>
            </View>
        )
    }
}