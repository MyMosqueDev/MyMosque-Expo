import ScrollContainer from "@/components/ScrollContainer";
import { getNextPrayer } from "@/lib/prayerTimeUtils";
import { PrayerTime } from "@/lib/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { AppState, View } from "react-native";
import Loading from "@/app/components/Loading";
import PrayerWarning from "./components/PrayerWarning";
import PrayerProgress from "./components/PrayerProgress";
import PrayerList from "./components/PrayerList";

/**
 * Prayer page component
 *
 * Displays prayer times with a warning, progress bar, and list.
 * Prayer times are passed via URL parameters and updated when the app is brought back to life.
 */
export default function Prayers() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { prayerTimes: prayerTimesParam } = useLocalSearchParams();

  // sets all the prayer times
  useEffect(() => {
    if (prayerTimesParam) {
      try {
        const parsedPrayerTimes = JSON.parse(prayerTimesParam as string);
        setPrayerTimes(parsedPrayerTimes);
      } catch (error) {
        console.error("Error parsing prayer times:", error);
        setPrayerTimes(null);
      }
    }
    setIsLoading(false);
  }, [prayerTimesParam]);

  // updates next prayer when app is brought back to life
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (prayerTimes) {
          const updatedNextPrayer = getNextPrayer(prayerTimes);
          setPrayerTimes({
            ...prayerTimes,
            nextPrayer: updatedNextPrayer,
          });
        }
      }
    });
    return () => {
      subscription.remove();
    };
  }, [prayerTimes]);

  if (isLoading || !prayerTimes) {
    return <Loading name="Prayer Times" />;
  }

  return (
    <ScrollContainer name="Prayer Times">
      <View className="flex-1 w-full px-2 pt-6">
        <View className="flex-1 justify-center items-center">
          {/* Warning Display */}
          {prayerTimes.warning && (
            <PrayerWarning warning={prayerTimes.warning} />
          )}
          {/* progress bar */}
          <PrayerProgress prayerTimes={prayerTimes} />

          {/* Prayer Times List with staggered animations */}
          <PrayerList prayerTimes={prayerTimes} />
        </View>
      </View>
    </ScrollContainer>
  );
}
