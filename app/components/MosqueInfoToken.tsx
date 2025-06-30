import Feather from '@expo/vector-icons/Feather';
import { Text, View } from "react-native";
import { MosqueData } from "../../lib/types";
interface GeneralMosqueInfo {
    address: MosqueData["address"];
    hours: MosqueData["hours"];
    events: MosqueData["events"];
}
export default function MosqueInfoToken({ info }: { info: GeneralMosqueInfo}) {
    return (
        <View className="w-full backdrop-blur-lg border border-white/30 rounded-2xl p-5 m-2 bg-white/50 shadow-md">
            <View className="flex-col justify-center mb-2">
                <View className="flex-row items-center gap-3">
                    <Feather name="map-pin" size={24} color="#3B5A7A" />
                    <Text className="text-xl font-bold text-[#3B5A7A]">{info.address.split(",")[0]}</Text>
                </View>
                <Text className="text-base text-[#5A6B7A] mt-0.5 ml-10">{info.address.split(",").slice(1).join(",").trim()}</Text>
            </View>
            <View className="flex-col justify-center mb-2">
                <View className="flex-row items-center gap-3">
                    <Feather name="clock" size={24} color="#4B944B" />
                    <Text className="text-xl font-bold text-[#4B944B]">Hours</Text>
                </View>
                <Text className="text-base text-[#4B944B] mt-0.5 ml-10">{info.hours.monday}</Text>
            </View>
            <View className="flex-col justify-center">
                <View className="flex-row items-center gap-3">
                    <Feather name="moon" size={24} color="#5B4B94" />
                    <Text className="text-xl font-bold text-[#5B4B94]">Upcoming</Text>
                </View>
                <Text className="text-base text-[#5B4B94] mt-0.5 ml-10">{info.events[0].title + ", " + info.events[0].time}</Text>
            </View>
        </View>
    )
}