import { PrayerTime } from "@/lib/types";
import { to12HourFormat } from "@/lib/utils";
import { MotiView, View } from "moti";
import { Text } from "react-native";

// Helper function to get prayer times
const getPrayerTimes = (prayer: any, prayerTimes: PrayerTime) => {
  if (prayer.isJummah) {
    const jummahKey = prayer.jummahKey;
    const jummahData = prayerTimes.jummah[jummahKey as keyof typeof prayerTimes.jummah];
    return {
      adhan: jummahData?.athan || "N/A",
      iqama: jummahData?.iqama || "N/A",
    };
  } else {
    const pt =
      prayerTimes[
        prayer.key as keyof Omit<PrayerTime, "nextPrayer" | "jummah">
      ];
    return {
      adhan: pt && typeof pt === "object" && "adhan" in pt ? pt.adhan.replace(/ [AP]M$/i, "") : "N/A",
      iqama: pt && typeof pt === "object" && "iqama" in pt ? pt.iqama.replace(/ [AP]M$/i, "") : "N/A",
    };
  }
};

// Helper function to get the prayer order based off of the data provided & day of the week
const getPrayerOrder = (prayerTimes: PrayerTime) => {
  const hasJummah = Object.keys(prayerTimes.jummah).length > 0;
  if (hasJummah) {
    let baseOrder = [
      { key: "fajr", label: "Fajr" },
      { key: "dhuhr", label: "Dhuhr" },
      { key: "asr", label: "Asr" },
      { key: "maghrib", label: "Maghrib" },
      { key: "isha", label: "Isha" },
    ];
    if (new Date().getDay() === 5) {
      baseOrder = [
        { key: "fajr", label: "Fajr" },
        { key: "asr", label: "Asr" },
        { key: "maghrib", label: "Maghrib" },
        { key: "isha", label: "Isha" },
      ];
    }

    // Insert Jummah prayers after Fajr
    const jummahPrayers = [];

    // Add first Jummah
    jummahPrayers.push({
      key: "jummah1",
      label: "Jummah 1",
      isJummah: true,
      jummahKey: "jummah1",
    });

    // Add second Jummah if it exists
    if (prayerTimes.jummah.jummah2) {
      jummahPrayers.push({
        key: "jummah2",
        label: "Jummah 2",
        isJummah: true,
        jummahKey: "jummah2",
      });
    }

    // Add third Jummah if it exists
    if (prayerTimes.jummah.jummah3) {
      jummahPrayers.push({
        key: "jummah3",
        label: "Jummah 3",
        isJummah: true,
        jummahKey: "jummah3",
      });
    }

    return [
      baseOrder[0], // Fajr
      ...jummahPrayers,
      ...baseOrder.slice(1), // Asr, Maghrib, Isha
    ];
  } else {
    // Regular prayer order
    return [
      { key: "fajr", label: "Fajr" },
      { key: "dhuhr", label: "Dhuhr" },
      { key: "asr", label: "Asr" },
      { key: "maghrib", label: "Maghrib" },
      { key: "isha", label: "Isha" },
    ];
  }
};

/**
 * PrayerList component
 *
 * Displays a list of prayer times.
 *
 * @param prayerTimes - The prayer times to display
 */
export default function PrayerList({prayerTimes,}: { prayerTimes: PrayerTime;}) {
  console.log("prayerTimes --", prayerTimes);
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
      {getPrayerOrder(prayerTimes).map((prayer: any, idx: number) => {
        const isCurrent = prayer.key === prayerTimes.nextPrayer.name;
        const { adhan, iqama } = getPrayerTimes(prayer, prayerTimes);
        console.log(prayer)
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
