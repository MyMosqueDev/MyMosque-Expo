import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from "react-native";
import { useMosqueData } from "@/app/_layout";

export default function Header({ name, type, title }: { name: string, type: string, title: string | null }) {
    const { mosqueData } = useMosqueData();
    name = mosqueData?.info.name || name;
    type = type || 'default'
    if (type === 'default') {
        return (
            <View className="w-full flex-row justify-between items-center px-4 pb-3 pt-24 pr-6">
                <Text className="text-text text-3xl font-lato-bold">{name.length > 23 ? name.substring(0, 23) + '...' : name}</Text>
                <TouchableOpacity onPress={() => router.replace('/map')}>
                    <MaterialCommunityIcons name="swap-horizontal" size={30} color="#4A4A4A" />
                </TouchableOpacity>
            </View>
        )
    }

    if (type === 'event') {
        return (
            <View className="w-full flex-row justify-between items-center px-4 pb-3 pt-24 ">
                <TouchableOpacity onPress={() => router.back()}>
                    <Feather name="arrow-left" size={24} color="#4A4A4A" />
                </TouchableOpacity>
                <View className="flex-col items-center">
                    <Text className="text-text text-3xl font-lato-bold">{title}</Text>
                    <Text className="text-text text-sm font-lato-bold">{name}</Text>
                </View>
                <Feather name="menu" size={24} color="#4A4A4A" />
            </View>
        )
    }
}