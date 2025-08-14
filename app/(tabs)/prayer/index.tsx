import ScrollContainer from "@/components/ScrollContainer";
import { getNextPrayer } from "@/lib/prayerTimeUtils";
import { JummahTime, PrayerTime } from "@/lib/types";
import { to12HourFormat } from "@/lib/utils";
import { useLocalSearchParams } from 'expo-router';
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { AppState, Text, View } from "react-native";

// TODO: make dynamic
const DAILY_QUOTE = {
    text: "The best of you are those who learn the Qur'an and teach it.",
    source: "— Prophet Muhammad (ﷺ)"
};

const getPrayerOrder = (prayerTimes: PrayerTime) => {
    const isFriday = new Date().getDay() === 5;
    const hasJummah = Object.keys(prayerTimes.jummah).length > 0;
    if (isFriday && hasJummah) {
        // On Friday with Jummah times, replace Dhuhr with Jummah prayers
        const baseOrder = [
            { key: 'fajr', label: 'Fajr' },
            { key: 'asr', label: 'Asr' },
            { key: 'maghrib', label: 'Maghrib' },
            { key: 'isha', label: 'Isha' }
        ];
        
        // Insert Jummah prayers after Fajr
        const jummahPrayers = [];
        
        // Add first Jummah
        jummahPrayers.push({
            key: 'jummah1',
            label: 'Jummah 1',
            isJummah: true,
            jummahKey: 'jummah1'
        });
        
        // Add second Jummah if it exists
        if (prayerTimes.jummah.jummah2) {
            jummahPrayers.push({
                key: 'jummah2',
                label: 'Jummah 2',
                isJummah: true,
                jummahKey: 'jummah2'
            });
        }
        
        // Add third Jummah if it exists
        if (prayerTimes.jummah.jummah3) {
            jummahPrayers.push({
                key: 'jummah3',
                label: 'Jummah 3',
                isJummah: true,
                jummahKey: 'jummah3'
            });
        }

        return [
            baseOrder[0], // Fajr
            ...jummahPrayers,
            ...baseOrder.slice(1) // Asr, Maghrib, Isha
        ];
    } else {
        // Regular prayer order
        return [
            { key: 'fajr', label: 'Fajr' },
            { key: 'dhuhr', label: 'Dhuhr' },
            { key: 'asr', label: 'Asr' },
            { key: 'maghrib', label: 'Maghrib' },
            { key: 'isha', label: 'Isha' }
        ];
    }
};

// takes in mins and converts to time (hh: mm)
const convertMinutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
        return `${hours} hr${hours > 1 ? 's' : ''} & ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`;
    } else {
        return `${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
}

export default function Prayers() {
    const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { prayerTimes: prayerTimesParam } = useLocalSearchParams();

    // sets prayer times from the url param
    useEffect(() => {
        if (prayerTimesParam) {
            try {
                const parsedPrayerTimes = JSON.parse(prayerTimesParam as string);
                setPrayerTimes(parsedPrayerTimes);
            } catch (error) {
                console.error('Error parsing prayer times:', error);
                setPrayerTimes(null);
            }
        }
        setIsLoading(false);
    }, [prayerTimesParam]);

    // updates next prayer when app is brought back to life
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                if (prayerTimes) {
                    const updatedNextPrayer = getNextPrayer(prayerTimes);
                    setPrayerTimes({
                        ...prayerTimes,
                        nextPrayer: updatedNextPrayer
                    });
                }
            }
        });
        return () => {
            subscription.remove();
        };
    }, [prayerTimes])

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

    return (
        <ScrollContainer name="Prayer Times">
            <View className="flex-1 w-full px-2 pt-6">
                <View className="flex-1 justify-center items-center">
                    {/* Warning Display */}
                    {prayerTimes.warning && (
                        <MotiView
                            from={{ opacity: 0, translateY: -20, scale: 0.95 }}
                            animate={{ opacity: 1, translateY: 0, scale: 1 }}
                            transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                            className="w-full max-w-md mb-4"
                        >
                            <View className="w-full bg-yellow-100 rounded-3xl p-3">
                                <Text className="text-yellow-700 text-sm font-lato-bold text-center">
                                    ⚠️ {prayerTimes.warning}
                                </Text>
                            </View>
                        </MotiView>
                    )}
                    {/* progress bar */}
                    <MotiView
                        from={{ opacity: 0, translateY: 30, scale: 0.95 }}
                        animate={{ opacity: 1, translateY: 0, scale: 1 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                        delay={50}
                        className="w-full max-w-md mb-6"
                    >
                        <View className="w-full flex-row justify-between px-2">
                            <Text className="text-[#4A4A4A] text-2xl font-lato-bold">{prayerTimes.nextPrayer.name.charAt(0).toUpperCase() + prayerTimes.nextPrayer.name.slice(1)}</Text>
                            <MotiView
                                from={{ opacity: 0.5, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ 
                                    type: 'timing', 
                                    duration: 1000,
                                    loop: true
                                }}
                            >
                                <Text className="text-[#4A4A4A] text-xl font-lato-bold pt-1">{convertMinutesToTime(prayerTimes.nextPrayer.minutesToNextPrayer)}</Text>
                            </MotiView>
                        </View>
                        <View className="w-full h-7 rounded-full overflow-hidden flex-row items-center bg-[#4A4A4A]/50">
                            <MotiView
                                from={{ opacity: 0, translateY: 30, scale: 0.95 }}
                                animate={{ opacity: 1, translateY: 0, scale: 1 }}
                                transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                                className={`h-7 rounded-full bg-[#4A4A4A]`}
                                style={{ width: `${prayerTimes.nextPrayer.percentElapsed * 100}%` }}
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
                        {/* displays all prayer times */}
                        {getPrayerOrder(prayerTimes).map((prayer: any, idx: number) => {
                            const isCurrent = prayer.key === prayerTimes.nextPrayer.name;
                            
                            let adhan, iqama;
                            if (prayer.isJummah) {
                                // Handle Jummah prayer times
                                const jummahData = prayerTimes.jummah[prayer.jummahKey as keyof JummahTime];
                                if (jummahData) {
                                    adhan = jummahData.athan;
                                    iqama = jummahData.iqama;
                                } else {
                                    adhan = "N/A";
                                    iqama = "N/A";
                                }
                            } else {
                                // Handle regular prayer times
                                const pt = prayerTimes[prayer.key as keyof Omit<PrayerTime, "nextPrayer" | "jummah">];
                                if (pt && typeof pt === 'object' && 'adhan' in pt && 'iqama' in pt) {
                                    adhan = pt.adhan;
                                    iqama = pt.iqama;
                                } else {
                                    adhan = "N/A";
                                    iqama = "N/A";
                                }
                            }
                            
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
                                        <Text className={`text-2xl font-lato-bold w-1/3 text-center ${isCurrent ? 'text-[#5B4B94]' : 'text-[#4A4A4A]/50'}`}>{to12HourFormat(adhan)}</Text>
                                        <Text className={`text-2xl font-lato-bold w-1/3 text-right ${isCurrent ? 'text-[#5B4B94]' : 'text-[#4A4A4A]/50'}`}>{to12HourFormat(iqama)}</Text>
                                    </View>
                                </MotiView>
                            );
                        })}
                    </MotiView>

                    {/* daily quote  TODO: make dynamic*/}
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
                                <Text className="text-xl font-lato-bold text-center mb-1 text-[#4A4A4A]">&quot;{DAILY_QUOTE.text}&quot;</Text>
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
