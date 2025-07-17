import ScrollContainer from "@/components/ScrollContainer";
import { PrayerTime } from "@/lib/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

const DAILY_QUOTE = {
    text: "The best of you are those who learn the Qur'an and teach it.",
    source: "— Prophet Muhammad (ﷺ)"
};

const PRAYER_ORDER = [
    { key: 'fajr', label: 'Fajr' },
    { key: 'dhuhr', label: 'Dhuhr' },
    { key: 'asr', label: 'Asr' },
    { key: 'maghrib', label: 'Maghrib' },
    { key: 'isha', label: 'Isha' }
];

export default function Prayers() {
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMosqueData = async () => {
            const prayerTimesString = await AsyncStorage.getItem('prayerTimes');
            if (prayerTimesString) {
                const parsedPrayerTimes = JSON.parse(prayerTimesString);
                setPrayerTimes(parsedPrayerTimes);
            }
            setIsLoading(false);
        };
        fetchMosqueData();
    }, []);

    if (isLoading || !prayerTimes) {
        return (
            <ScrollContainer name="Prayer Times">
                <MotiView
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                    className="flex-1 items-center justify-center"
                >
                    <Text className="text-text text-[24px] font-lato-bold">Loading...</Text>
                </MotiView>
            </ScrollContainer>
        );
    }

    // Assume current prayer is Maghrib
    const currentPrayerKey = 'maghrib';
    const currentIndex = PRAYER_ORDER.findIndex(p => p.key === currentPrayerKey);
    const progressPercent = ((currentIndex + 1) / PRAYER_ORDER.length) * 100;

    return (
        <ScrollContainer name="Prayer Times">
            <View className="flex-1 w-full px-2 pt-6">
                <View className="flex-1 justify-center items-center">
                    {/* Progress Bar with entrance and pulsing animation */}
                    <MotiView
                        from={{ opacity: 0, translateY: 30, scale: 0.95 }}
                        animate={{ opacity: 1, translateY: 0, scale: 1 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                        delay={50}
                        className="w-full max-w-md mb-6"
                    >
                        <View className="w-full flex-row justify-between px-2">
                            <Text className="text-[#4A4A4A] text-2xl font-lato-bold">Maghrib</Text>
                            <MotiView
                                from={{ opacity: 0.5, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ 
                                    type: 'timing', 
                                    duration: 1000,
                                    loop: true
                                }}
                            >
                                <Text className="text-[#4A4A4A] text-xl font-lato-bold pt-1">14 min 20 sec</Text>
                            </MotiView>
                        </View>
                        <View className="w-full h-7 rounded-full overflow-hidden flex-row items-center bg-[#4A4A4A]/50">
                            <MotiView
                                from={{ opacity: 0, translateY: 30, scale: 0.95 }}
                                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                                transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                                className={`h-7 rounded-full bg-[#4A4A4A]`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </View>
                    </MotiView>

                    {/* Prayer Times List with staggered animations */}
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 300 }}
                        delay={150}
                        className="w-full max-w-md flex-col mb-8 mt-2"
                    >
                        {/* Header Row */}
                        <View className="flex-row justify-between items-center py-2 px-2 mb-1">
                            <Text className="text-xl font-lato-bold text-[#4A4A4A] w-1/3">PRAYER</Text>
                            <Text className="text-xl font-lato-bold text-[#4A4A4A] w-1/3 text-center">ADHAN</Text>
                            <Text className="text-xl font-lato-bold text-[#4A4A4A] w-1/3 text-right">IQAMA</Text>
                        </View>
                        {PRAYER_ORDER.map((prayer, idx) => {
                            const isCurrent = prayer.key === currentPrayerKey;
                            const pt = prayerTimes[prayer.key as keyof typeof prayerTimes];
                            const adhan = pt.adhan;
                            const iqama = pt.iqama;
                            return (
                                <MotiView
                                    key={prayer.key}
                                    from={{ opacity: 0, translateX: -20 }}
                                    animate={{ opacity: 1, translateX: 0 }}
                                    transition={{ 
                                        type: 'spring', 
                                        damping: 15, 
                                        stiffness: 150,
                                        delay: 200 + (idx * 50)
                                    }}
                                >
                                    <View className="flex-row justify-between items-center py-2 px-2">
                                        <Text className={`text-2xl font-lato-bold w-1/3 ${isCurrent ? 'text-[#5B4B94]' : 'text-[#4A4A4A]/50'}`}>{prayer.label}</Text>
                                        <Text className={`text-2xl font-lato-bold w-1/3 text-center ${isCurrent ? 'text-[#5B4B94]' : 'text-[#4A4A4A]/50'}`}>{adhan}</Text>
                                        <Text className={`text-2xl font-lato-bold w-1/3 text-right ${isCurrent ? 'text-[#5B4B94]' : 'text-[#4A4A4A]/50'}`}>{iqama}</Text>
                                    </View>
                                </MotiView>
                            );
                        })}
                    </MotiView>

                    {/* Daily Quote Section with entrance animation */}
                    <MotiView
                        from={{ opacity: 0, translateY: 30, scale: 0.95 }}
                        animate={{ opacity: 1, translateY: 0, scale: 1 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                        delay={400}
                        className="w-full items-center"
                    >
                        <View className="w-5/6 bg-white/70 rounded-2xl p-5 shadow-md border border-white/30 items-center">
                            <Text className="text-2xl font-lato-bold mb-6 text-[#4A4A4A]">Daily Quote</Text>
                            <MotiView
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ type: 'timing', duration: 400, delay: 500 }}
                            >
                                <Text className="text-xl font-lato-bold text-center mb-1 text-[#4A4A4A]">"{DAILY_QUOTE.text}"</Text>
                            </MotiView>
                            <MotiView
                                from={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ type: 'timing', duration: 400, delay: 600 }}
                            >
                                <Text className="text-lg font-lato-bold text-center text-[#4A4A4A]">{DAILY_QUOTE.source}</Text>
                            </MotiView>
                        </View>
                    </MotiView>
                </View>
            </View>
        </ScrollContainer>
    );
}
