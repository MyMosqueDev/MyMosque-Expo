import Feather from '@expo/vector-icons/Feather';
import { MotiView } from "moti";
import { Text, View } from "react-native";
import { MosqueData } from "../../lib/types";

interface GeneralMosqueInfo {
    address: MosqueData["address"];
    hours: MosqueData["hours"];
    events: MosqueData["events"];
}

export default function MosqueInfoToken({ info }: { info: GeneralMosqueInfo}) {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 100 }}
            className="w-full backdrop-blur-lg border border-white/30 rounded-2xl p-5 m-2 bg-white/50 shadow-md"
        >
            <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 400 }}
                delay={200}
            >
                <View className="flex-col justify-center mb-2">
                    <View className="flex-row items-center gap-3">
                        <MotiView
                            from={{ rotate: '0deg' }}
                            animate={{ rotate: '360deg' }}
                            transition={{ type: 'timing', duration: 1000, delay: 500 }}
                        >
                            <Feather name="map-pin" size={24} color="#3B5A7A" />
                        </MotiView>
                        <Text className="text-xl font-bold text-[#3B5A7A]">{info.address.split(",")[0]}</Text>
                    </View>
                    <Text className="text-base text-[#5A6B7A] mt-0.5 ml-10">{info.address.split(",").slice(1).join(",").trim()}</Text>
                </View>
            </MotiView>

            <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 400 }}
                delay={400}
            >
                <View className="flex-col justify-center mb-2">
                    <View className="flex-row items-center gap-3">
                        <MotiView
                            from={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 700 }}
                        >
                            <Feather name="clock" size={24} color="#4B944B" />
                        </MotiView>
                        <Text className="text-xl font-bold text-[#4B944B]">Hours</Text>
                    </View>
                    <Text className="text-base text-[#4B944B] mt-0.5 ml-10">{info.hours.monday}</Text>
                </View>
            </MotiView>

            <MotiView
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'timing', duration: 400 }}
                delay={600}
            >
                <View className="flex-col justify-center">
                    <View className="flex-row items-center gap-3">
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: 'timing', duration: 500, delay: 900 }}
                        >
                            <Feather name="moon" size={24} color="#5B4B94" />
                        </MotiView>
                        <Text className="text-xl font-bold text-[#5B4B94]">Upcoming</Text>
                    </View>
                    <Text className="text-base text-[#5B4B94] mt-0.5 ml-10">{info.events[0].title + ", " + info.events[0].time}</Text>
                </View>
            </MotiView>
        </MotiView>
    )
}