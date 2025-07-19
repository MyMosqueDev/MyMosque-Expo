import * as Font from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncStorage } from './syncStorage';
import { format } from 'date-fns';

export const loadFonts = async () => {
    await Font.loadAsync({
        'Lato-Regular': require('../assets/fonts/Lato-Regular.ttf'),
        'Lato-Bold': require('../assets/fonts/Lato-Bold.ttf'),
        'Lato-Light': require('../assets/fonts/Lato-Light.ttf'),
        'Lato-Black': require('../assets/fonts/Lato-Black.ttf'),
        'Lato-Thin': require('../assets/fonts/Lato-Thin.ttf'),
        'Lato-Italic': require('../assets/fonts/Lato-Italic.ttf'),
        'Lato-BoldItalic': require('../assets/fonts/Lato-BoldItalic.ttf'),
        'Lato-BlackItalic': require('../assets/fonts/Lato-BlackItalic.ttf'),
        'Lato-LightItalic': require('../assets/fonts/Lato-LightItalic.ttf'),
        'Lato-ThinItalic': require('../assets/fonts/Lato-ThinItalic.ttf'),
    });
}; 

export const to12HourFormat = (time24: string) => {
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    hour = hour % 12 || 12;
    return `${hour}:${minute}`;
}

export const fetchMosqueInfo = async () => {
    const userDataString = await AsyncStorage.getItem('userData');

    if (userDataString) {
        const lastVisitedMosqueId = JSON.parse(userDataString).lastVisitedMosque;
        const mosqueData = await syncStorage(lastVisitedMosqueId);
        const date = new Date().setHours(0, 0, 0,0 );
        const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss") + '+00:00';

        return {
            ...mosqueData,
            prayerTimes: mosqueData.prayerTimes[formattedDate],
        }
    }

    return null;
}