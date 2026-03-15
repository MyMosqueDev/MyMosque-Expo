import { Platform, Text, View } from "react-native";
import { PrayerTime } from "../../lib/types";

type PrayerKey = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

const getPrayerTime = (prayerTimes: PrayerTime, prayerKey: PrayerKey) => {
  const prayerData =
    prayerTimes[prayerKey];
  if (typeof prayerData === "object" && prayerData && "iqama" in prayerData) {
    return prayerData.iqama.replace(/ [AP]M$/i, "");
  }
  return "N/A";
};

export default function PrayerToken({
  prayerTimes,
}: {
  prayerTimes: PrayerTime;
}) {
  // sets prayer names
  const prayerNames = [
    { key: "fajr", label: "Fajr" },
    { key: "dhuhr", label: "Dhuhr" },
    { key: "asr", label: "Asr" },
    { key: "maghrib", label: "Maghrib" },
    { key: "isha", label: "Isha" },
  ];

  return (
    <View
      className={`w-full h-20 flex flex-row border border-white/30 rounded-2xl m-1 shadow-md ${
        Platform.OS === "android"
          ? "bg-[#f5f7fa]"
          : "backdrop-blur-lg bg-white/50"
      }`}
    >
      {/* displays all prayer times */}
      {prayerNames.map(({ key, label }, index) => {
        const isCurrentPrayer = key === prayerTimes.nextPrayer.name;
        return (
          <View
            key={key}
            className={`w-1/5 items-center justify-center ${
              index === 0
                ? "rounded-l-2xl"
                : index === prayerNames.length - 1
                  ? "rounded-r-2xl"
                  : ""
            } ${isCurrentPrayer ? "bg-[#5B4B94]/70 rounded-2xl" : ""}`}
          >
            <Text
              className={`text-md font-lato-bold ${
                isCurrentPrayer ? "text-white" : "text-text"
              }`}
            >
              {label}
            </Text>
            <Text
              className={`text-md font-lato-bold ${
                isCurrentPrayer ? "text-white" : "text-text"
              }`}
            >
              {getPrayerTime(prayerTimes, key as PrayerKey)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
