import { DBPrayerTimes, DailyPrayerTimes, JummahTime, PrayerTime } from "./types";
import { to24HourFormat } from "./utils";

export const getCurrentPrayerTime = (prayerTimesData: DBPrayerTimes, jummahTimes: JummahTime) => {
  const now = new Date();
  const date = now.getDate() - 1;
  const prayerTimes: DBPrayerTimes['prayer_times'] = prayerTimesData.prayer_times;
  const currentPrayerTime: DailyPrayerTimes = prayerTimes[date].times;
  const mmyy = `${now.getMonth() + 1}-${now.getFullYear().toString().slice(-2)}`;
  const warning = mmyy !== prayerTimesData["mm-yy"] ? "Current prayer times may be outdated" : null;

  const res: PrayerTime = {
    fajr: currentPrayerTime.fajr,
    dhuhr: currentPrayerTime.dhuhr,
    asr: currentPrayerTime.asr,
    maghrib: currentPrayerTime.maghrib,
    isha: currentPrayerTime.isha,
    jummah: jummahTimes,
    nextPrayer: { name: "", minutesToNextPrayer: 0, percentElapsed: 0 },
    warning,
  };

  const next = getNextPrayer(res);

  res.nextPrayer = next;

  return res;
}

// function to get the next prayer time based on current time
export const getNextPrayer = (prayerTimes: PrayerTime) => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const isFriday = now.getDay() === 5;

  // gets the prayer times in minutes (converts to 24hr format first)
  let prayers = Object.entries(prayerTimes)
    .filter(([key, value]) => {
      // Only include prayer keys (fajr, dhuhr, asr, maghrib, isha) and ensure they have iqama
      const prayerKeys = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
      return (
        prayerKeys.includes(key) &&
        typeof value === "object" &&
        value !== null &&
        "iqama" in value
      );
    })
    .map(([name, value]) => {
      const iqama = (value as any).iqama;
      const iqama24 = to24HourFormat(iqama); // Convert to 24hr format
      const [hours, minutes] = iqama24.split(":").map(Number);
      return { name, minutes: hours * 60 + minutes, displayName: name };
    });

  // On Friday, replace dhuhr with jummah times
  if (isFriday && prayerTimes.jummah && Array.isArray(prayerTimes.jummah)) {
    // Remove dhuhr from prayers
    prayers = prayers.filter((p) => p.name !== "dhuhr");

    // Add jummah times
    prayerTimes.jummah.forEach((jummah: any, index: number) => {
      const iqama24 = to24HourFormat(jummah.iqama); // Convert to 24hr format
      const [hours, minutes] = iqama24.split(":").map(Number);
      prayers.push({
        name: `jummah_${index + 1}`,
        minutes: hours * 60 + minutes,
        displayName: jummah.name || `Jummah ${index + 1}`,
      });
    });
  }

  prayers.sort((a, b) => a.minutes - b.minutes);
  // finds the next prayer time
  let nextPrayer = prayers.find((p) => p.minutes > currentTime);
  let currentPrayer = null;
  let minutesToNextPrayer = 0;
  let percentElapsed = 0;

  // if the next prayer time is not found, set the next prayer time to the first prayer time and the current prayer time to the last prayer time
  if (!nextPrayer) {
    nextPrayer = prayers[0];
    currentPrayer = prayers[prayers.length - 1];
    minutesToNextPrayer = 24 * 60 - currentTime + nextPrayer.minutes;
  } else {
    // if the next prayer time is found, set the current prayer time to the previous prayer time
    const nextIndex = prayers.findIndex((p) => p.name === nextPrayer!.name);
    currentPrayer = prayers[(nextIndex - 1 + prayers.length) % prayers.length];
    minutesToNextPrayer = nextPrayer.minutes - currentTime;
  }

  // gets the interval between the current prayer and the next prayer
  let interval = nextPrayer.minutes - currentPrayer.minutes;
  if (interval <= 0) interval += 24 * 60;
  let elapsed = currentTime - currentPrayer.minutes;
  if (elapsed < 0) elapsed += 24 * 60;
  percentElapsed = Math.max(0, Math.min(1, elapsed / interval));

  // Return the display name for jummah prayers, otherwise the regular name
  const prayerName = (nextPrayer as any).displayName || nextPrayer.name;

  return {
    name: prayerName,
    minutesToNextPrayer,
    percentElapsed,
  };
};

export const addMinutesToTime = (time24: string, minutesToAdd: number) => {
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