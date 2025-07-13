import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { createContext, useContext, useEffect, useState } from "react";
import { ImageBackground, View } from "react-native";
import NavBar from "../components/NavBar";
import '../global.css';
import { loadFonts } from "../lib/utils";

SplashScreen.preventAutoHideAsync();

// Create context to track if map is being shown
export const MapContext = createContext({
  isMapVisible: false,
  setIsMapVisible: (visible: boolean) => {},
});

export const useMapContext = () => useContext(MapContext);

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);
  
  useEffect(() => {
    async function prepare() {
      await loadFonts();
      setFontsLoaded(true);
      await SplashScreen.hideAsync();
    }

    prepare();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <MapContext.Provider value={{ isMapVisible, setIsMapVisible }}>
      <ImageBackground 
        source={require('../assets/background.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="announcements" 
              options={{ 
                animation: 'slide_from_right'
              }}
            />
            <Stack.Screen 
              name="eventDetails" 
              options={{ 
                animation: 'slide_from_right'
              }}
            />
          </Stack>
          {!isMapVisible && <NavBar />}
        </View>
      </ImageBackground>
    </MapContext.Provider>
  );
}
