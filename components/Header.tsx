import { View, Text } from "react-native";
import Feather from '@expo/vector-icons/Feather';
export default function Header({ name }: { name: string }) {
    return (
        <View className="w-full flex-row justify-between items-center px-4 pb-3 pt-24 ">
            <Text className="text-text text-3xl font-lato-bold">{name}</Text>
            <Feather name="menu" size={24} color="#4A4A4A" />
        </View>
    )
}