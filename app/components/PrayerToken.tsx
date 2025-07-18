import { Text, View } from "react-native";
import { PrayerTime } from "../../lib/types";
import { to12HourFormat } from "@/lib/utils";

export default function PrayerToken({ prayerTimes }: { prayerTimes: PrayerTime }) {


    const prayerNames = [
        { key: 'fajr', label: 'Fajr' },
        { key: 'dhuhr', label: 'Dhuhr' },
        { key: 'asr', label: 'Asr' },
        { key: 'maghrib', label: 'Maghrib' },
        { key: 'isha', label: 'Isha' }
    ];

    return (
        <View className="w-full h-20 flex flex-row backdrop-blur-lg border border-white/30 rounded-2xl m-1 bg-white/50 shadow-md">
            {prayerNames.map((prayer, index) => {
                const isCurrentPrayer = prayer.key === prayerTimes.nextPrayer.name;
                return (
                    <View 
                        key={prayer.key}
                        className={`w-1/5 items-center justify-center ${
                            index === 0 ? 'rounded-l-2xl' : 
                            index === prayerNames.length - 1 ? 'rounded-r-2xl' : ''
                        } ${
                            isCurrentPrayer ? 'bg-[#5B4B94]/70 rounded-2xl' : ''
                        }`}
                    >
                        <Text className={`text-md font-lato-bold ${
                            isCurrentPrayer ? 'text-white' : 'text-text'
                        }`}>{prayer.label}</Text>
                        <Text className={`text-md font-lato-bold ${
                            isCurrentPrayer ? 'text-white' : 'text-text'
                        }`}>{to12HourFormat(prayerTimes[prayer.key as keyof Omit<PrayerTime, "nextPrayer">].iqama)}</Text>
                    </View>
                );
            })}
        </View>
    )
}