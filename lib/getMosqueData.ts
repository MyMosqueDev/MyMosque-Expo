import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getLocationPrayerTimes from "./getLocationPrayerTimes";
import { PrayerTime } from "./types";

/**
 * gets prayer times for a given mosque
 * @param city - the city to get prayer times for
 * @param lastVisitedMosqueId - the id of the mosque to get prayer times for
 * @returns the prayer times for the given mosque in the right format
 */
export const getPrayerTimes = async (
  city: string,
  lastVisitedMosqueId: string,
) => {
  const today = new Date();
  const year = today.getUTCFullYear();
  const month = String(today.getUTCMonth() + 1).padStart(2, "0");
  const day = String(today.getUTCDate()).padStart(2, "0");
  const todayDbString = `${year}-${month}-${day} 00:00:00+00`; // this is the format of the date in the database

  // gets the prayer times for the given mosque
  const { data: mosquePrayerTimes, error: prayerTimesError } = await supabase
    .from("prayer_times")
    .select()
    .eq("masjid_id", lastVisitedMosqueId)
    .eq("date", todayDbString)
    .single();

  try {
    const prayerTimes = await getLocationPrayerTimes(city); // prayer times from the api
    for (let key in prayerTimes) {
      // key is the prayer name
      const formattedAdhan = to12HourFormat(
        prayerTimes[key as keyof PrayerTime],
      );
      const adhan24 = prayerTimes[key as keyof PrayerTime];
      const prayerKey = key.toLowerCase() as keyof PrayerTime; // need to lowercase because the api returns the prayer times in lowercase

      if (mosquePrayerTimes.times.prayerTimes[prayerKey]) {
        // if the prayer time already exists, update it
        mosquePrayerTimes.times.prayerTimes[prayerKey].adhan = formattedAdhan;
        const iqamaVal = mosquePrayerTimes.times.prayerTimes[prayerKey].iqama;

        // some iqama times are in the format +x, so we need to add x minutes to the adhan time
        if (typeof iqamaVal === "string" && iqamaVal.startsWith("+")) {
          const minutesToAdd = parseInt(iqamaVal.slice(1), 10);
          const iqama24 = addMinutesToTime(adhan24, minutesToAdd);
          mosquePrayerTimes.times.prayerTimes[prayerKey].iqama = iqama24;
        } else {
          let suffix = prayerKey === "fajr" ? " AM" : " PM";
          if (typeof iqamaVal === "string") {
            // some iqama times are in the format x:xx, so we need to add the suffix
            let iqama24 = toMilitaryTime(iqamaVal + suffix);
            // some iqama times are in the format x:xx AM/PM, so we need to convert it to 24 hour format
            if (iqamaVal.endsWith("AM") || iqamaVal.endsWith("PM")) {
              iqama24 = toMilitaryTime(iqamaVal);
            }
            mosquePrayerTimes.times.prayerTimes[prayerKey].iqama = iqama24;
          }
        }
      }
    }
    const nextPrayer = getNextPrayer(mosquePrayerTimes.times.prayerTimes); // gets the next prayer
    mosquePrayerTimes.times.prayerTimes.nextPrayer = nextPrayer; // adds the next prayer to the prayer times
  } catch (e) {
    console.error(e);
  }
  return mosquePrayerTimes.times;
};

/**
 * gets the next prayer
 * @param prayerTimes - the prayer times to get the next prayer from
 * @returns the next prayer
 */
const getNextPrayer = (prayerTimes: PrayerTime) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const prayers = Object.entries(prayerTimes)
    .filter(([_, value]) => (value as any).iqama)
    .map(([name, value]) => {
      const iqama = (value as any).iqama;
      const [hours, minutes] = iqama.split(":").map(Number);
      return { name, minutes: hours * 60 + minutes };
    });
  prayers.sort((a, b) => a.minutes - b.minutes);

  let nextPrayer = prayers.find((p) => p.minutes > currentTime);
  let currentPrayer = null;
  let minutesToNextPrayer = 0;
  let percentElapsed = 0;

  if (!nextPrayer) {
    nextPrayer = prayers[0];
    currentPrayer = prayers[prayers.length - 1];
    minutesToNextPrayer = 24 * 60 - currentTime + nextPrayer.minutes;
  } else {
    const nextIndex = prayers.findIndex((p) => p.name === nextPrayer!.name);
    currentPrayer = prayers[(nextIndex - 1 + prayers.length) % prayers.length];
    minutesToNextPrayer = nextPrayer.minutes - currentTime;
  }

  let interval = nextPrayer.minutes - currentPrayer.minutes;
  if (interval <= 0) interval += 24 * 60; // handle overnight
  let elapsed = currentTime - currentPrayer.minutes;
  if (elapsed < 0) elapsed += 24 * 60;
  percentElapsed = Math.max(0, Math.min(1, elapsed / interval));

  return {
    name: nextPrayer.name,
    minutesToNextPrayer,
    percentElapsed,
  };
};

// converts 24 hour format to 12 hour format
const to12HourFormat = (time24: string) => {
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  hour = hour % 12 || 12;
  return `${hour}:${minute}`;
};

// adds minutes to a time
const addMinutesToTime = (time24: string, minutesToAdd: number) => {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  let minute = parseInt(minuteStr, 10);

  minute += minutesToAdd;
  hour += Math.floor(minute / 60);
  minute = minute % 60;
  hour = hour % 24;

  const hourFormatted = hour.toString().padStart(2, "0");
  const minuteFormatted = minute.toString().padStart(2, "0");
  return `${hourFormatted}:${minuteFormatted}`;
};

// converts 12 hour format to 24 hour format
const toMilitaryTime = (time12h: string) => {
  const [time, modifier] = time12h.trim().split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier.toUpperCase() === "PM" && hours < 12) {
    hours += 12;
  }
  if (modifier.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  const hoursStr = hours.toString().padStart(2, "0");
  const minutesStr = minutes.toString().padStart(2, "0");

  return `${hoursStr}:${minutesStr}`;
};
