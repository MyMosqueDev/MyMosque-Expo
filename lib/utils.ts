import * as Font from 'expo-font';

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