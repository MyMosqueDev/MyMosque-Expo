import { useMosqueData } from "@/app/_layout";
import Loading from "@/app/components/Loading";
import ScrollContainer from "@/components/ScrollContainer";
import { View } from "react-native";
import PrayerList from "./components/PrayerList";
import PrayerProgress from "./components/PrayerProgress";
import PrayerWarning from "./components/PrayerWarning";

/**
 * Prayer page component
 *
 * Displays today's prayer times with a warning, progress bar, and list.
 */
export default function Prayers() {
  const { mosqueData } = useMosqueData();

  if (!mosqueData) {
    return <Loading name="Prayer Times" />;
  }

  const { prayerTimes } = mosqueData;
  return (
    <ScrollContainer name="Prayer Times">
      <View className="flex-1 w-full px-2 pt-6">
        <View className="flex-1 justify-center items-center">
          {prayerTimes.warning && (
            <PrayerWarning warning={prayerTimes.warning} />
          )}
          <PrayerProgress prayerTimes={prayerTimes} />
          <PrayerList prayerTimes={prayerTimes} />
        </View>
      </View>
    </ScrollContainer>
  );
}
