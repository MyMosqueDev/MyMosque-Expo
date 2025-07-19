import getLocationPrayerTimes from "./getLocationPrayerTimes";
import { supabase } from "./supabase";
import { PrayerTime } from "./types";
import { to12HourFormat } from "./utils";

/**
 * Gets prayer times for the entire month from the database and formats them
 * @param city - the city of the mosque
 * @param lastVisitedMosqueId - the id of the mosque
 * @param createdAfter - optional date filter for incremental sync
 * @returns the prayer times for the month in correct format
 */
export const getPrayerTimes = async (city: string, lastVisitedMosqueId: string, createdAfter?: string) => {
    // Get current month's start and end dates
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth() + 1;
    const endOfMonth = new Date(year, month, 0);
    
    const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00+00`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')} 23:59:59+00`;

    try {
        // Fetch prayer times for the entire month
        let query = supabase
            .from('prayer_times')
            .select()
            .eq('masjid_id', lastVisitedMosqueId)
            .gte('date', startDate)
            .lte('date', endDate);

        if (createdAfter) {
            query = query.or(`created_at.gt.${createdAfter},updated_at.gt.${createdAfter}`);
        }

        const { data: monthPrayerTimes, error } = await query;

        if (error) {
            console.error('Error fetching prayer times:', error);
            return null;
        }

        // Format each day's prayer times
        const formattedPrayerTimes: { [date: string]: PrayerTime } = {};
        
        for (const dayPrayerTime of monthPrayerTimes || []) {
            const formattedDay = await formatPrayerTimes(city, dayPrayerTime.times);
            formattedPrayerTimes[dayPrayerTime.date] = formattedDay;
        }

        return formattedPrayerTimes;
    } catch (error) {
        console.error('Error in getPrayerTimes:', error);
        return null;
    }
}

/**
 * Gets the prayer times from the db, updates them based on local prayer time, and inserts in correct format
 * @param city - the city of the mosque
 * @param mosquePrayerTimes - the prayer times from the database
 * @returns the prayer times in correct format
 */
export const formatPrayerTimes = async (city: string, mosquePrayerTimes: any) => {
    try {
        // fetches prayer times based off mosque location
        const prayerTimes = await getLocationPrayerTimes(city);
        mosquePrayerTimes = mosquePrayerTimes.prayerTimes;
        // updates the prayer times based on local prayer time
        for (let key in prayerTimes) {
            const formattedAdhan = to12HourFormat(prayerTimes[key as keyof PrayerTime]);
            const adhan24 = prayerTimes[key as keyof PrayerTime];
            const prayerKey = key.toLowerCase() as keyof PrayerTime;
            // Only process if it's a valid prayer key and has the expected structure
            if (mosquePrayerTimes[prayerKey] && typeof mosquePrayerTimes[prayerKey] === 'object' && 'iqama' in mosquePrayerTimes[prayerKey]) {
                
                mosquePrayerTimes[prayerKey].adhan = formattedAdhan;
                const iqamaVal = mosquePrayerTimes[prayerKey].iqama;
                // if the iqama is a string and starts with a +, add the minutes to the adhan
                if (typeof iqamaVal === "string" && iqamaVal.startsWith("+")) {
                    const minutesToAdd = parseInt(iqamaVal.slice(1), 10);
                    const iqama24 = addMinutesToTime(adhan24, minutesToAdd);
                    mosquePrayerTimes[prayerKey].iqama = iqama24;
                } else {
                    // if the iqama is a string and doesn't start with a +, convert to military time
                    let suffix = prayerKey === 'fajr' ? ' AM' : ' PM';
                    if (typeof iqamaVal === 'string') {
                        let iqama24 = toMilitaryTime(iqamaVal + suffix);
                        if (iqamaVal.endsWith('AM') || iqamaVal.endsWith('PM')) {
                            iqama24 = toMilitaryTime(iqamaVal);
                        }
                        mosquePrayerTimes[prayerKey].iqama = iqama24;
                    }
                }
            }
        }
        // gets the next prayer times and inserts it
        const nextPrayer = getNextPrayer(mosquePrayerTimes);
        mosquePrayerTimes.nextPrayer = nextPrayer;
    } catch (e) {
        console.error(e);
    }
    return mosquePrayerTimes;
}

// function to get the next prayer time based on current time
const getNextPrayer = (prayerTimes: any) => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // gets the prayer times in minutes
    const prayers = Object.entries(prayerTimes)
        .filter(([key, value]) => {
            // Only include prayer keys (fajr, dhuhr, asr, maghrib, isha) and ensure they have iqama
            const prayerKeys = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
            return prayerKeys.includes(key) && 
                    typeof value === 'object' && 
                    value !== null && 
                    'iqama' in value;
        })
        .map(([name, value]) => {
            const iqama = (value as any).iqama;
            const [hours, minutes] = iqama.split(":").map(Number);
            return { name, minutes: hours * 60 + minutes };
        });
    prayers.sort((a, b) => a.minutes - b.minutes);

    // finds the next prayer time
    let nextPrayer = prayers.find(p => p.minutes > currentTime);
    let currentPrayer = null;
    let minutesToNextPrayer = 0;
    let percentElapsed = 0;

    // if the next prayer time is not found, set the next prayer time to the first prayer time and the current prayer time to the last prayer time
    if (!nextPrayer) {
        nextPrayer = prayers[0];
        currentPrayer = prayers[prayers.length - 1];
        minutesToNextPrayer = (24 * 60 - currentTime) + nextPrayer.minutes;
    } else {
        // if the next prayer time is found, set the current prayer time to the previous prayer time
        const nextIndex = prayers.findIndex(p => p.name === nextPrayer!.name);
        currentPrayer = prayers[(nextIndex - 1 + prayers.length) % prayers.length];
        minutesToNextPrayer = nextPrayer.minutes - currentTime;
    }

    // gets the interval between the current prayer and the next prayer
    let interval = nextPrayer.minutes - currentPrayer.minutes;
    if (interval <= 0) interval += 24 * 60;
    let elapsed = currentTime - currentPrayer.minutes;
    if (elapsed < 0) elapsed += 24 * 60;
    percentElapsed = Math.max(0, Math.min(1, elapsed / interval));

    
    return {
        name: nextPrayer.name,
        minutesToNextPrayer,
        percentElapsed
    };
}

const addMinutesToTime = (time24: string, minutesToAdd: number) => {
    const [hourStr, minuteStr] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    let minute = parseInt(minuteStr, 10);

    minute += minutesToAdd;
    hour += Math.floor(minute / 60);
    minute = minute % 60;
    hour = hour % 24;

    const hourFormatted = hour.toString().padStart(2, '0');
    const minuteFormatted = minute.toString().padStart(2, '0');
    return `${hourFormatted}:${minuteFormatted}`;
}

const toMilitaryTime = (time12h: string) => {
    const [time, modifier] = time12h.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier.toUpperCase() === 'PM' && hours < 12) {
        hours += 12;
    }
    if (modifier.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
    }

    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');

    return `${hoursStr}:${minutesStr}`;
}