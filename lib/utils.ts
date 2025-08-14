import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import * as Font from 'expo-font';
import { syncStorage } from './syncStorage';

// loads in all the fonts
export const loadFonts = async () => {
    try {
        console.log('Loading font files...');
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
        console.log('All fonts loaded successfully');
    } catch (error) {
        console.error('Error loading fonts:', error);
        throw new Error(`Failed to load fonts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}; 

// converts 24 hour format to 12 hour format
export const to12HourFormat = (time24: string) => {
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    hour = hour % 12 || 12;
    return `${hour}:${minute}`;
}

/**
 * fetches the mosque info from the local storage
 * @returns the mosque info
 */
export const fetchMosqueInfo = async () => {
    const userDataString = await AsyncStorage.getItem('userData');
    if (userDataString) {
        const lastVisitedMosqueId = JSON.parse(userDataString).lastVisitedMosque;
        const mosqueData = await syncStorage(lastVisitedMosqueId);

        return {
            ...mosqueData,
            prayerTimes: mosqueData.prayerTimes,
        }
    }

    return null;
}