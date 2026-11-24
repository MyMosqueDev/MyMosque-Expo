import { Platform, Text, View } from "react-native";
import { getJummahSlots, isFriday } from "../../lib/prayerTimeUtils";
import { PrayerTime } from "../../lib/types";

type Cell = { key: string; label: string; iqama: string; isNext: boolean };

// On Fridays the Dhuhr cell shows the upcoming Jummah, or the first once all are over
const getCells = (prayerTimes: PrayerTime): Cell[] => {
  const next = prayerTimes.nextPrayer.name;
  const jummah = isFriday(new Date()) ? getJummahSlots(prayerTimes.jummah) : [];
  const nextJummah = jummah.find(({ key }) => key === next);
  const shownJummah = nextJummah ?? jummah[0];

  const regular = (
    key: "fajr" | "dhuhr" | "asr" | "maghrib" | "isha",
    label: string,
  ) => ({
    key,
    label,
    iqama: prayerTimes[key].iqama,
    isNext: key === next,
  });

  return [
    regular("fajr", "Fajr"),
    shownJummah
      ? {
          key: "jummah",
          label: "Jummah",
          iqama: shownJummah.iqama,
          isNext: !!nextJummah,
        }
      : regular("dhuhr", "Dhuhr"),
    regular("asr", "Asr"),
    regular("maghrib", "Maghrib"),
    regular("isha", "Isha"),
  ];
};

export default function PrayerToken({
  prayerTimes,
}: {
  prayerTimes: PrayerTime;
}) {
  const cells = getCells(prayerTimes);

  return (
    <View
      className={`w-full h-20 flex flex-row border border-white/30 rounded-2xl m-1 shadow-md ${
        Platform.OS === "android"
          ? "bg-[#f5f7fa]"
          : "backdrop-blur-lg bg-white/50"
      }`}
    >
      {/* displays all prayer times */}
      {cells.map(({ key, label, iqama, isNext }, index) => {
        return (
          <View
            key={key}
            className={`w-1/5 items-center justify-center ${
              index === 0
                ? "rounded-l-2xl"
                : index === cells.length - 1
                  ? "rounded-r-2xl"
                  : ""
            } ${isNext ? "bg-[#5B4B94]/70 rounded-2xl" : ""}`}
          >
            <Text
              className={`text-md font-lato-bold ${
                isNext ? "text-white" : "text-text"
              }`}
            >
              {label}
            </Text>
            <Text
              className={`text-md font-lato-bold ${
                isNext ? "text-white" : "text-text"
              }`}
            >
              {iqama?.replace(/ [AP]M$/i, "") || "N/A"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
