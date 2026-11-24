import { getJummahSlots, isFriday } from "@/lib/prayerTimeUtils";
import { PrayerTime } from "@/lib/types";
import { MotiView, View } from "moti";
import { Text } from "react-native";

type Row = { key: string; label: string; adhan: string; iqama: string };

const withoutPeriod = (time: string | undefined) =>
  time?.replace(/ [AP]M$/i, "") || "N/A";

// Jummah is listed after Fajr every day, and takes the place of Dhuhr on Fridays
const getRows = (prayerTimes: PrayerTime): Row[] => {
  const { fajr, dhuhr, asr, maghrib, isha } = prayerTimes;
  const jummah = getJummahSlots(prayerTimes.jummah);
  const showDhuhr = !isFriday(new Date()) || jummah.length === 0;

  return [
    { key: "fajr", label: "Fajr", ...fajr },
    ...jummah,
    ...(showDhuhr ? [{ key: "dhuhr", label: "Dhuhr", ...dhuhr }] : []),
    { key: "asr", label: "Asr", ...asr },
    { key: "maghrib", label: "Maghrib", ...maghrib },
    { key: "isha", label: "Isha", ...isha },
  ];
};

/**
 * PrayerList component
 *
 * Displays a list of prayer times.
 *
 * @param prayerTimes - The prayer times to display
 */
export default function PrayerList({
  prayerTimes,
}: {
  prayerTimes: PrayerTime;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 300 }}
      delay={150}
      className="w-full max-w-md flex-col mb-8 mt-2"
    >
      {/* Header Row */}
      <View className="flex-row justify-between items-center py-2 px-2 mb-1">
        <Text className="text-xl font-lato-bold text-[#4A4A4A] w-1/3">
          PRAYER
        </Text>
        <Text className="text-xl font-lato-bold text-[#4A4A4A] w-1/3 text-center">
          ADHAN
        </Text>
        <Text className="text-xl font-lato-bold text-[#4A4A4A] w-1/3 text-right">
          IQAMA
        </Text>
      </View>

      {/* Prayer List */}
      {getRows(prayerTimes).map((prayer, idx) => {
        const isCurrent = prayer.key === prayerTimes.nextPrayer.name;
        const adhan = withoutPeriod(prayer.adhan);
        const iqama = withoutPeriod(prayer.iqama);
        return (
          <MotiView
            key={prayer.key}
            from={{ opacity: 0, translateX: -20 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{
              type: "spring",
              damping: 15,
              stiffness: 150,
              delay: 200 + idx * 50,
            }}
          >
            <View className="flex-row justify-between items-center py-2 px-2">
              <Text
                className={`text-2xl font-lato-bold w-1/3 ${isCurrent ? "text-[#5B4B94]" : "text-[#4A4A4A]/50"}`}
              >
                {prayer.label}
              </Text>
              <Text
                className={`text-2xl font-lato-bold w-1/3 text-center ${isCurrent ? "text-[#5B4B94]" : "text-[#4A4A4A]/50"}`}
              >
                {adhan}
              </Text>
              <Text
                className={`text-2xl font-lato-bold w-1/3 text-right ${isCurrent ? "text-[#5B4B94]" : "text-[#4A4A4A]/50"}`}
              >
                {iqama}
              </Text>
            </View>
          </MotiView>
        );
      })}
    </MotiView>
  );
}
