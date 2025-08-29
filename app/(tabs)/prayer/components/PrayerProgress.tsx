import { MotiView } from "moti";
import { PrayerTime } from "@/lib/types";
import { Text, View } from "react-native";

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

/**
 * PrayerProgress component
 * 
 * Displays the progress of the next prayer.
 * 
 * @param prayerTimes - The prayer times to display
 */
export default function PrayerProgress({ prayerTimes }: { prayerTimes: PrayerTime }) {
    return (
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
    )
}