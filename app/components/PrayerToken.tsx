import { to12HourFormat } from "@/lib/utils";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { PrayerTime } from "../../lib/types";

// Helper function to safely get prayer time
const getPrayerTime = (prayerTimes: PrayerTime, prayerKey: string) => {
  const prayerData =
    prayerTimes[prayerKey as keyof Omit<PrayerTime, "nextPrayer">];
  if (typeof prayerData === "object" && prayerData && "iqama" in prayerData) {
    return prayerData.iqama;
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

  const handlePress = () => {
    router.push("/(tabs)/prayer");
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      className="w-full h-20 flex flex-row backdrop-blur-lg border border-white/30 rounded-2xl m-1 bg-white/50 shadow-md active:bg-white/70"
      activeOpacity={0.8}
    >
      {/* displays all prayer times */}
      {prayerNames.map((prayer, index) => {
        // checks if current prayer
        const isCurrentPrayer = prayer.key === prayerTimes.nextPrayer.name;
        return (
          <View
            key={prayer.key}
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
              {prayer.label}
            </Text>
            <Text
              className={`text-md font-lato-bold ${
                isCurrentPrayer ? "text-white" : "text-text"
              }`}
            >
              {to12HourFormat(getPrayerTime(prayerTimes, prayer.key))}
            </Text>
          </View>
        );
      })}
    </TouchableOpacity>
  );
}
