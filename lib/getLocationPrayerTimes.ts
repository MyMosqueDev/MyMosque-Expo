export default async function getLocationPrayerTimes(city: string) {
    const today = new Date();
    const url = `https://api.aladhan.com/v1/timingsByCity/${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}?city=${city}&country=United States`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
    }

    const data = await response.json();
    return data.data.timings;
}