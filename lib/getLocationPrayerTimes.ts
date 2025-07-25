/**
 * gets prayer times for a given city and date
 * @param city - the city to get prayer times for
 * @param date - the date to get prayer times for (defaults to today)
 * @returns the prayer times for the given city and date
 */
export default async function getLocationPrayerTimes(city: string, date?: Date) {
    const targetDate = date || new Date();
    const url = `https://api.aladhan.com/v1/timingsByCity/${targetDate.getDate()}-${targetDate.getMonth()+1}-${targetDate.getFullYear()}?city=${city}&country=United States`;
    const response = await fetch(url);

    if (!response.ok) {
        console.log(response);
        throw new Error('Failed to fetch prayer times', { cause: response.statusText });
    }

    const data = await response.json();
    return data.data.timings;
}